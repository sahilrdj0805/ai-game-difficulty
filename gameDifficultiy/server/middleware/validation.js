const validatePlayerData = (req, res, next) => {
  const { score, reactionTime, mistakes, speed } = req.body;
  
  // Check required fields
  if (score === undefined || reactionTime === undefined || 
      mistakes === undefined || speed === undefined) {
    return res.status(400).json({
      error: 'Missing required fields',
      required: ['score', 'reactionTime', 'mistakes', 'speed']
    });
  }
  
  // Validate data types
  if (typeof score !== 'number' || typeof reactionTime !== 'number' ||
      typeof mistakes !== 'number' || typeof speed !== 'number') {
    return res.status(400).json({
      error: 'Invalid data types',
      message: 'All fields must be numbers'
    });
  }
  
  // Validate ranges
  if (score < 0 || reactionTime < 0 || mistakes < 0 || speed < 0) {
    return res.status(400).json({
      error: 'Invalid values',
      message: 'All values must be positive numbers'
    });
  }
  
  next();
};

module.exports = { validatePlayerData };