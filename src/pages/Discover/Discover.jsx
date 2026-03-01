/**
 * Discover Page
 * 
 * Main course discovery page with search and filters.
 * Accessible to all users (authenticated and anonymous).
 */

import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCourses } from '../../hooks/useCourses';
import { useAuth } from '../../hooks/useAuth';
import { userService } from '../../services/userService';
import { Card, Input, Select, Loader, EmptyState, Button } from '../../components';
import styles from './Discover.module.css';

// Filter options
const DIFFICULTY_OPTIONS = [
  { value: '', label: 'All Difficulties' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' }
];

const PLATFORM_OPTIONS = [
  { value: '', label: 'All Platforms' },
  { value: 'Udemy', label: 'Udemy' },
  { value: 'Coursera', label: 'Coursera' },
  { value: 'edX', label: 'edX' },
  { value: 'Pluralsight', label: 'Pluralsight' },
  { value: 'YouTube', label: 'YouTube' }
];

const DURATION_OPTIONS = [
  { value: '', label: 'Any Duration' },
  { value: 'short', label: 'Short (< 5 hours)' },
  { value: 'medium', label: 'Medium (5-20 hours)' },
  { value: 'long', label: 'Long (> 20 hours)' }
];

// Sort options
const SORT_OPTIONS = [
  { value: 'title-asc', label: 'Title A-Z' },
  { value: 'title-desc', label: 'Title Z-A' },
  { value: 'duration-asc', label: 'Duration: Short to Long' },
  { value: 'duration-desc', label: 'Duration: Long to Short' },
  { value: 'difficulty-asc', label: 'Difficulty: Easy to Hard' },
  { value: 'difficulty-desc', label: 'Difficulty: Hard to Easy' }
];

// Pagination options
const PAGE_SIZE_OPTIONS = [
  { value: 12, label: '12 per page' },
  { value: 24, label: '24 per page' },
  { value: 48, label: '48 per page' }
];

// Difficulty order for sorting
const DIFFICULTY_ORDER = { beginner: 1, intermediate: 2, advanced: 3 };

// Popular quick filter chips
const QUICK_FILTERS = [
  'React', 'Python', 'JavaScript', 'Node.js', 'AWS', 'Docker', 'TypeScript', 'SQL'
];

export function Discover() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { courses, loading, error } = useCourses();
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [platform, setPlatform] = useState('');
  const [duration, setDuration] = useState('');
  const [technology, setTechnology] = useState('');
  const [sortBy, setSortBy] = useState('title-asc');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  
  // Recently viewed
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [showRecentlyViewed, setShowRecentlyViewed] = useState(true);

  // Extract unique technologies from courses with count
  const technologyOptions = useMemo(() => {
    const techCount = {};
    courses.forEach(c => {
      c.technologies.forEach(t => {
        techCount[t] = (techCount[t] || 0) + 1;
      });
    });
    const techs = Object.entries(techCount).sort((a, b) => a[0].localeCompare(b[0]));
    return [
      { value: '', label: 'All Technologies' },
      ...techs.map(([t, count]) => ({ value: t, label: `${t} (${count})` }))
    ];
  }, [courses]);

  // Calculate popularity for courses (based on comprehensive content)
  const popularCourseIds = useMemo(() => {
    // Mark courses with 4+ technologies and 10+ hours as "popular"
    return new Set(
      courses
        .filter(c => c.technologies.length >= 4 && c.durationHours >= 10)
        .slice(0, 20)
        .map(c => c.id)
    );
  }, [courses]);

  // Handle quick filter click
  const handleQuickFilter = (tech) => {
    if (technology === tech) {
      setTechnology('');
    } else {
      setTechnology(tech);
    }
    setCurrentPage(1);
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const platforms = new Set(courses.map(c => c.platform));
    const technologies = new Set(courses.flatMap(c => c.technologies));
    const totalHours = courses.reduce((sum, c) => sum + c.durationHours, 0);
    return {
      totalCourses: courses.length,
      platforms: platforms.size,
      technologies: technologies.size,
      totalHours: Math.round(totalHours)
    };
  }, [courses]);

  // Fetch recently viewed courses
  useEffect(() => {
    async function fetchRecentlyViewed() {
      if (!isAuthenticated || !user) return;
      try {
        const views = await userService.getViewHistory(user.uid);
        // Get unique course IDs, most recent first
        const viewMap = new Map();
        views.forEach(v => {
          if (!viewMap.has(v.courseId) || (v.viewedAt && v.viewedAt.toDate() > viewMap.get(v.courseId))) {
            viewMap.set(v.courseId, v.viewedAt?.toDate() || new Date(0));
          }
        });
        const sortedIds = [...viewMap.entries()]
          .sort((a, b) => b[1] - a[1])
          .map(([id]) => id)
          .slice(0, 4);
        
        const recentCourses = sortedIds
          .map(id => courses.find(c => c.id === id))
          .filter(Boolean);
        setRecentlyViewed(recentCourses);
      } catch (err) {
        console.error('Error fetching recently viewed:', err);
      }
    }
    if (courses.length > 0) {
      fetchRecentlyViewed();
    }
  }, [isAuthenticated, user, courses]);

  // Filter and sort courses
  const filteredCourses = useMemo(() => {
    let result = courses.filter(course => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        course.title.toLowerCase().includes(searchLower) ||
        course.description.toLowerCase().includes(searchLower) ||
        course.technologies.some(tech => tech.toLowerCase().includes(searchLower)) ||
        course.instructor.toLowerCase().includes(searchLower);

      // Difficulty filter
      const matchesDifficulty = !difficulty || course.difficulty === difficulty;

      // Platform filter
      const matchesPlatform = !platform || course.platform === platform;

      // Technology filter
      const matchesTechnology = !technology || 
        course.technologies.some(t => t.toLowerCase() === technology.toLowerCase());

      // Duration filter
      let matchesDuration = true;
      if (duration) {
        if (duration === 'short') {
          matchesDuration = course.durationHours < 5;
        } else if (duration === 'medium') {
          matchesDuration = course.durationHours >= 5 && course.durationHours <= 20;
        } else if (duration === 'long') {
          matchesDuration = course.durationHours > 20;
        }
      }

      return matchesSearch && matchesDifficulty && matchesPlatform && matchesDuration && matchesTechnology;
    });

    // Sort courses
    const [field, direction] = sortBy.split('-');
    result.sort((a, b) => {
      let comparison = 0;
      if (field === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else if (field === 'duration') {
        comparison = a.durationHours - b.durationHours;
      } else if (field === 'difficulty') {
        comparison = DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty];
      }
      return direction === 'desc' ? -comparison : comparison;
    });

    return result;
  }, [courses, searchQuery, difficulty, platform, duration, technology, sortBy]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredCourses.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedCourses = filteredCourses.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleCourseClick = (courseId) => {
    navigate(`/course/${courseId}`);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setDifficulty('');
    setPlatform('');
    setDuration('');
    setTechnology('');
    setSortBy('title-asc');
    setCurrentPage(1);
  };

  // Surprise me - random course
  const handleSurpriseMe = () => {
    if (courses.length === 0) return;
    const randomIndex = Math.floor(Math.random() * courses.length);
    navigate(`/course/${courses[randomIndex].id}`);
  };

  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const hasActiveFilters = searchQuery || difficulty || platform || duration || technology;

  if (loading) {
    return <Loader centered text="Loading courses..." />;
  }

  if (error) {
    return (
      <EmptyState
        icon={<EmptyState.BookIcon />}
        title="Unable to load courses"
        message={error}
        action={<Button onClick={() => window.location.reload()}>Try Again</Button>}
      />
    );
  }

  return (
    <div className={styles.discover}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Discover Courses</h1>
        <p className={styles.subtitle}>
          Find the perfect course to advance your skills
        </p>
      </div>

      {/* Statistics Banner */}
      <div className={styles.statsBanner}>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{stats.totalCourses}</span>
          <span className={styles.statLabel}>Courses</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.statItem}>
          <span className={styles.statValue}>{stats.platforms}</span>
          <span className={styles.statLabel}>Platforms</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.statItem}>
          <span className={styles.statValue}>{stats.technologies}</span>
          <span className={styles.statLabel}>Technologies</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.statItem}>
          <span className={styles.statValue}>{stats.totalHours.toLocaleString()}h</span>
          <span className={styles.statLabel}>Content</span>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleSurpriseMe}
          className={styles.surpriseBtn}
        >
          🎲 Surprise Me
        </Button>
      </div>

      {/* Recently Viewed */}
      {isAuthenticated && recentlyViewed.length > 0 && showRecentlyViewed && (
        <div className={styles.recentlyViewed}>
          <div className={styles.recentlyViewedHeader}>
            <h3 className={styles.recentlyViewedTitle}>Recently Viewed</h3>
            <button 
              className={styles.hideBtn}
              onClick={() => setShowRecentlyViewed(false)}
            >
              Hide
            </button>
          </div>
          <div className={styles.recentlyViewedList}>
            {recentlyViewed.map(course => (
              <div 
                key={course.id} 
                className={styles.recentCourse}
                onClick={() => navigate(`/course/${course.id}`)}
              >
                {course.thumbnailUrl && (
                  <img src={course.thumbnailUrl} alt="" className={styles.recentThumbnail} />
                )}
                <div className={styles.recentInfo}>
                  <span className={styles.recentTitle}>{course.title}</span>
                  <span className={styles.recentPlatform}>{course.platform}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Filter Chips */}
      <div className={styles.quickFilters}>
        <span className={styles.quickFiltersLabel}>Popular:</span>
        {QUICK_FILTERS.map(tech => (
          <button
            key={tech}
            className={`${styles.quickFilterChip} ${technology === tech ? styles.quickFilterActive : ''}`}
            onClick={() => handleQuickFilter(tech)}
          >
            {tech}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchWrapper}>
          <Input
            type="search"
            placeholder="Search courses, technologies, instructors..."
            value={searchQuery}
            onChange={handleSearchChange}
            className={styles.searchInput}
          />
        </div>
        
        <div className={styles.filterRow}>
          <Select
            options={PLATFORM_OPTIONS}
            value={platform}
            onChange={handleFilterChange(setPlatform)}
            className={styles.filterSelect}
          />
          <Select
            options={DIFFICULTY_OPTIONS}
            value={difficulty}
            onChange={handleFilterChange(setDifficulty)}
            className={styles.filterSelect}
          />
          <Select
            options={DURATION_OPTIONS}
            value={duration}
            onChange={handleFilterChange(setDuration)}
            className={styles.filterSelect}
          />
          <Select
            options={technologyOptions}
            value={technology}
            onChange={handleFilterChange(setTechnology)}
            className={styles.filterSelect}
          />
        </div>
        <div className={styles.sortRow}>
          <Select
            options={SORT_OPTIONS}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={styles.sortSelect}
          />
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Results Info */}
      <div className={styles.resultsInfo}>
        <span className={styles.resultsCount}>
          {filteredCourses.length > 0 
            ? `Showing ${startIndex + 1}-${Math.min(endIndex, filteredCourses.length)} of ${filteredCourses.length} courses`
            : '0 courses found'
          }
        </span>
        <Select
          options={PAGE_SIZE_OPTIONS}
          value={pageSize}
          onChange={handlePageSizeChange}
          className={styles.pageSizeSelect}
        />
      </div>

      {/* Course Grid */}
      {paginatedCourses.length > 0 ? (
        <>
          <div className={styles.courseGrid}>
            {paginatedCourses.map(course => (
              <CourseCard 
                key={course.id} 
                course={course} 
                onClick={() => handleCourseClick(course.id)}
                isPopular={popularCourseIds.has(course.id)}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button 
                className={styles.pageButton}
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Previous page"
              >
                ← Prev
              </button>
              
              <div className={styles.pageNumbers}>
                {getPageNumbers().map((page, index) => (
                  page === '...' ? (
                    <span key={`ellipsis-${index}`} className={styles.ellipsis}>...</span>
                  ) : (
                    <button
                      key={page}
                      className={`${styles.pageNumber} ${currentPage === page ? styles.active : ''}`}
                      onClick={() => goToPage(page)}
                      aria-label={`Page ${page}`}
                      aria-current={currentPage === page ? 'page' : undefined}
                    >
                      {page}
                    </button>
                  )
                ))}
              </div>
              
              <button 
                className={styles.pageButton}
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Next page"
              >
                Next →
              </button>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          icon={<EmptyState.SearchIcon />}
          title="No courses found"
          message="Try adjusting your search or filters to find what you're looking for."
          action={
            hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )
          }
        />
      )}
    </div>
  );
}

/**
 * CourseCard - Individual course card component
 */
function CourseCard({ course, onClick, isPopular }) {
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return styles.difficultyBeginner;
      case 'intermediate': return styles.difficultyIntermediate;
      case 'advanced': return styles.difficultyAdvanced;
      default: return '';
    }
  };

  return (
    <Card onClick={onClick} padding="none" className={styles.courseCard}>
      <div className={styles.cardImageWrapper}>
        {course.thumbnailUrl && (
          <Card.Image src={course.thumbnailUrl} alt={course.title} />
        )}
        {isPopular && (
          <span className={styles.popularBadge}>⭐ Popular</span>
        )}
      </div>
      <Card.Body>
        <div className={styles.cardMeta}>
          <span className={styles.platform}>{course.platform}</span>
          <span className={`${styles.difficulty} ${getDifficultyColor(course.difficulty)}`}>
            {course.difficulty}
          </span>
        </div>
        <h3 className={styles.cardTitle}>{course.title}</h3>
        <p className={styles.cardInstructor}>by {course.instructor}</p>
        <p className={styles.cardDescription}>{course.description}</p>
        <div className={styles.cardTechnologies}>
          {course.technologies.slice(0, 3).map(tech => (
            <span key={tech} className={styles.techBadge}>{tech}</span>
          ))}
          {course.technologies.length > 3 && (
            <span className={styles.techBadge}>+{course.technologies.length - 3}</span>
          )}
        </div>
        <div className={styles.cardFooter}>
          <span className={styles.duration}>{course.durationHours}h</span>
          <span className={styles.depth}>{course.depth}</span>
        </div>
      </Card.Body>
    </Card>
  );
}
