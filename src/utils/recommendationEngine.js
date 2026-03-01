/**
 * Recommendation Engine
 * 
 * This module implements the deterministic, explainable recommendation algorithm.
 * It calculates personalized scores for courses based on user preferences and interactions.
 * 
 * SCORING BREAKDOWN (Total: 100 points max):
 * - Technology Match: 0-40 points
 * - Difficulty Match: 0-20 points
 * - Depth Match: 0-15 points
 * - Duration Match: 0-15 points
 * - Interaction Boost: 0-10 points
 */

/**
 * Calculate recommendation score and explanation for a course
 * 
 * @param {Object} course - Course object
 * @param {Object} preferences - User preferences
 * @param {Object} interactions - User interactions (favorites, evaluations, views)
 * @returns {Object} { score, explanation, breakdown }
 */
export function calculateRecommendationScore(course, preferences, interactions) {
  const breakdown = {
    technology: { score: 0, maxScore: 40, matched: [], reason: '' },
    difficulty: { score: 0, maxScore: 20, reason: '' },
    depth: { score: 0, maxScore: 15, reason: '' },
    duration: { score: 0, maxScore: 15, reason: '' },
    interaction: { score: 0, maxScore: 10, reason: '' }
  };

  // 1. Technology Match (0-40 points)
  const techResult = calculateTechnologyScore(course, preferences);
  breakdown.technology = { ...breakdown.technology, ...techResult };

  // 2. Difficulty Match (0-20 points)
  const diffResult = calculateDifficultyScore(course, preferences);
  breakdown.difficulty = { ...breakdown.difficulty, ...diffResult };

  // 3. Depth Match (0-15 points)
  const depthResult = calculateDepthScore(course, preferences);
  breakdown.depth = { ...breakdown.depth, ...depthResult };

  // 4. Duration Match (0-15 points)
  const durationResult = calculateDurationScore(course, preferences);
  breakdown.duration = { ...breakdown.duration, ...durationResult };

  // 5. Interaction Boost (0-10 points)
  const interactionResult = calculateInteractionScore(course, interactions);
  breakdown.interaction = { ...breakdown.interaction, ...interactionResult };

  // Calculate total score
  const totalScore = 
    breakdown.technology.score +
    breakdown.difficulty.score +
    breakdown.depth.score +
    breakdown.duration.score +
    breakdown.interaction.score;

  // Generate human-readable explanation
  const explanation = generateExplanation(breakdown, course);

  return {
    score: Math.round(totalScore),
    explanation,
    breakdown
  };
}

/**
 * Calculate technology match score
 */
function calculateTechnologyScore(course, preferences) {
  const preferredTechs = preferences.technologies || [];
  
  if (preferredTechs.length === 0) {
    return { score: 0, matched: [], reason: 'No technology preferences set' };
  }

  const courseTechs = course.technologies || [];
  const matched = courseTechs.filter(tech => 
    preferredTechs.some(pref => 
      pref.toLowerCase() === tech.toLowerCase()
    )
  );

  // Score based on how many preferred technologies are covered
  const matchRatio = matched.length / preferredTechs.length;
  const score = Math.round(matchRatio * 40);

  let reason;
  if (matched.length === 0) {
    reason = 'No matching technologies';
  } else if (matched.length === 1) {
    reason = `Covers ${matched[0]}`;
  } else {
    reason = `Covers ${matched.slice(0, -1).join(', ')} and ${matched[matched.length - 1]}`;
  }

  return { score, matched, reason };
}

/**
 * Calculate difficulty match score
 */
function calculateDifficultyScore(course, preferences) {
  const preferredDifficulty = preferences.difficulty;
  const courseDifficulty = course.difficulty;

  if (!preferredDifficulty) {
    return { score: 0, reason: 'No difficulty preference set' };
  }

  const levels = ['beginner', 'intermediate', 'advanced'];
  const preferredIndex = levels.indexOf(preferredDifficulty);
  const courseIndex = levels.indexOf(courseDifficulty);
  const diff = Math.abs(preferredIndex - courseIndex);

  let score, reason;
  if (diff === 0) {
    score = 20;
    reason = `Matches your ${preferredDifficulty} level preference`;
  } else if (diff === 1) {
    score = 10;
    reason = `Close to your preferred ${preferredDifficulty} level`;
  } else {
    score = 0;
    reason = `${capitalize(courseDifficulty)} level differs from your preference`;
  }

  return { score, reason };
}

/**
 * Calculate depth match score
 */
function calculateDepthScore(course, preferences) {
  const preferredDepth = preferences.depth;
  const courseDepth = course.depth;

  if (!preferredDepth) {
    return { score: 0, reason: 'No depth preference set' };
  }

  const levels = ['overview', 'standard', 'comprehensive'];
  const preferredIndex = levels.indexOf(preferredDepth);
  const courseIndex = levels.indexOf(courseDepth);
  const diff = Math.abs(preferredIndex - courseIndex);

  let score, reason;
  if (diff === 0) {
    score = 15;
    reason = `Matches your ${preferredDepth} depth preference`;
  } else if (diff === 1) {
    score = 7;
    reason = `Close to your preferred ${preferredDepth} depth`;
  } else {
    score = 0;
    reason = `${capitalize(courseDepth)} depth differs from your preference`;
  }

  return { score, reason };
}

/**
 * Calculate duration match score
 */
function calculateDurationScore(course, preferences) {
  const preferredDuration = preferences.duration;
  const courseHours = course.durationHours;

  if (!preferredDuration) {
    return { score: 0, reason: 'No duration preference set' };
  }

  // Map preference to hour ranges
  const ranges = {
    short: { min: 0, max: 5, label: 'short (under 5 hours)' },
    medium: { min: 5, max: 20, label: 'medium (5-20 hours)' },
    long: { min: 20, max: Infinity, label: 'long (over 20 hours)' }
  };

  const preferred = ranges[preferredDuration];
  const isExactMatch = courseHours >= preferred.min && courseHours < preferred.max;
  
  // Check if it's close (within one category)
  let isClose = false;
  if (preferredDuration === 'short' && courseHours < 10) isClose = true;
  if (preferredDuration === 'medium' && courseHours >= 3 && courseHours <= 25) isClose = true;
  if (preferredDuration === 'long' && courseHours >= 15) isClose = true;

  let score, reason;
  if (isExactMatch) {
    score = 15;
    reason = `Duration (${courseHours}h) matches your ${preferred.label} preference`;
  } else if (isClose) {
    score = 7;
    reason = `Duration (${courseHours}h) is close to your ${preferred.label} preference`;
  } else {
    score = 0;
    reason = `Duration (${courseHours}h) doesn't match your ${preferred.label} preference`;
  }

  return { score, reason };
}

/**
 * Calculate interaction boost score
 */
function calculateInteractionScore(course, interactions) {
  const { favorites = [], evaluations = [], views = [] } = interactions;
  
  let score = 0;
  const reasons = [];

  // Check if user has favorited courses with similar technologies
  const courseTechs = course.technologies || [];
  const favoritedTechs = new Set();
  favorites.forEach(fav => {
    if (fav.technologies) {
      fav.technologies.forEach(tech => favoritedTechs.add(tech.toLowerCase()));
    }
  });

  const hasSimilarFavorite = courseTechs.some(tech => 
    favoritedTechs.has(tech.toLowerCase())
  );

  if (hasSimilarFavorite) {
    score += 5;
    reasons.push('Similar to courses you\'ve favorited');
  }

  // Check if user has highly rated similar courses
  const highlyRatedTechs = new Set();
  evaluations.forEach(eval_ => {
    const avgRating = (eval_.quality + eval_.clarity + eval_.depth) / 3;
    if (avgRating >= 4 && eval_.technologies) {
      eval_.technologies.forEach(tech => highlyRatedTechs.add(tech.toLowerCase()));
    }
  });

  const hasSimilarHighRating = courseTechs.some(tech => 
    highlyRatedTechs.has(tech.toLowerCase())
  );

  if (hasSimilarHighRating) {
    score += 5;
    reasons.push('Similar to courses you\'ve rated highly');
  }

  const reason = reasons.length > 0 
    ? reasons.join(' and ')
    : 'No similar interaction history';

  return { score, reason };
}

/**
 * Generate human-readable explanation
 */
function generateExplanation(breakdown, course) {
  const parts = [];

  // Technology explanation
  if (breakdown.technology.matched && breakdown.technology.matched.length > 0) {
    const techs = breakdown.technology.matched;
    if (techs.length === 1) {
      parts.push(`covers **${techs[0]}** which you're interested in`);
    } else {
      parts.push(`covers **${techs.join('** and **')}** (technologies you selected)`);
    }
  }

  // Difficulty explanation
  if (breakdown.difficulty.score === 20) {
    parts.push(`matches your **${course.difficulty}** difficulty preference`);
  }

  // Depth explanation (only mention if exact match)
  if (breakdown.depth.score === 15) {
    parts.push(`provides **${course.depth}** content depth`);
  }

  // Interaction explanation
  if (breakdown.interaction.score > 0) {
    if (breakdown.interaction.reason.includes('favorited')) {
      parts.push('is similar to courses you\'ve saved');
    }
    if (breakdown.interaction.reason.includes('rated highly')) {
      parts.push('relates to courses you\'ve enjoyed');
    }
  }

  if (parts.length === 0) {
    return 'This course may match some of your learning goals.';
  }

  const explanation = 'This course is recommended because it ' + 
    formatList(parts) + '.';

  return explanation;
}

/**
 * Format a list with proper grammar
 */
function formatList(items) {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  
  return items.slice(0, -1).join(', ') + ', and ' + items[items.length - 1];
}

/**
 * Capitalize first letter
 */
function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

/**
 * Get recommended courses sorted by score
 * 
 * @param {Array} courses - All available courses
 * @param {Object} preferences - User preferences
 * @param {Object} interactions - User interactions
 * @param {number} limit - Maximum number of recommendations
 * @returns {Array} Sorted array of courses with scores and explanations
 */
export function getRecommendedCourses(courses, preferences, interactions, limit = 10) {
  // Calculate scores for all courses
  const scoredCourses = courses.map(course => {
    const { score, explanation, breakdown } = calculateRecommendationScore(
      course,
      preferences,
      interactions
    );
    return { ...course, recommendationScore: score, explanation, breakdown };
  });

  // Sort by score (highest first)
  scoredCourses.sort((a, b) => b.recommendationScore - a.recommendationScore);

  // Filter out very low scores and limit results
  const minScore = 20; // Minimum score threshold
  return scoredCourses
    .filter(course => course.recommendationScore >= minScore)
    .slice(0, limit);
}

