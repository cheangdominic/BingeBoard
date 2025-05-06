import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createRequire } from 'module';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create a require function for dynamic imports
const require = createRequire(import.meta.url);

// Define global utility functions
global.base_dir = __dirname;
global.abs_path = function(path) {
    return base_dir + path;
};
global.include = function(file) {
    return require(abs_path('/' + file));
};