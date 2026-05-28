module.exports = {
    testEnvironment: 'node',
    coverageDirectory: 'coverage',
    testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
    collectCoverageFrom: [
        'src/utils/**/*.js',
        'src/infrastructure/http/middlewares/auth.middleware.js',
        'src/infrastructure/http/middlewares/logger.js',
        'src/infrastructure/http/controllers/plan.controller.js',
        'src/infrastructure/http/controllers/auth.controller.js'
    ]
};