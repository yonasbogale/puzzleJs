const path = require('path');

const loadConfigurationFromEnv = (name: string, isObject = false) => {
    const environmentVariable = process.env[name];
    if (isObject) {
        return environmentVariable ? JSON.parse(environmentVariable) : undefined;
    } else {
        return environmentVariable;
    }
};


export const DEFAULT_POLLING_INTERVAL = +loadConfigurationFromEnv('DEFAULT_POLLING_INTERVAL') || 10000;
export const CONTENT_NOT_FOUND_ERROR = loadConfigurationFromEnv('CONTENT_NOT_FOUND_ERROR') || `<script>console.log('Fragment Part does not exists')</script>`;
export const DEFAULT_CONTENT_TIMEOUT = +loadConfigurationFromEnv('DEFAULT_CONTENT_TIMEOUT') || 2800;
export const GLOBAL_REQUEST_TIMEOUT = +loadConfigurationFromEnv('GLOBAL_REQUEST_TIMEOUT') || 3100;
export const RENDER_MODE_QUERY_NAME = loadConfigurationFromEnv('RENDER_MODE_QUERY_NAME') || '__renderMode';
export const PREVIEW_PARTIAL_QUERY_NAME = loadConfigurationFromEnv('PREVIEW_PARTIAL_QUERY_NAME') || '__partial';
export const VERSION_QUERY_NAME = loadConfigurationFromEnv('VERSION_QUERY_NAME') || '__version';
export const API_ROUTE_PREFIX = loadConfigurationFromEnv('API_ROUTE_PREFIX') || 'api';
export const GATEWAY_PREPERATION_CHECK_INTERVAL = +loadConfigurationFromEnv('GATEWAY_PREPERATION_CHECK_INTERVAL') || 200;
export const CHEERIO_CONFIGURATION = loadConfigurationFromEnv('CHEERIO_CONFIGURATION', true) || {
    normalizeWhitespace: true,
    recognizeSelfClosing: true,
    xmlMode: true,
    lowerCaseAttributeNames: true,
    decodeEntities: false
};
export const TEMPLATE_FRAGMENT_TAG_NAME = loadConfigurationFromEnv('TEMPLATE_FRAGMENT_TAG_NAME') || 'fragment';
export const DEFAULT_GZIP_EXTENSIONS = loadConfigurationFromEnv('DEFAULT_GZIP_EXTENSIONS', true) || ['.js', '.css'];
export const DEBUG_QUERY_NAME = loadConfigurationFromEnv('DEBUG_QUERY_NAME') || '__debug';
export const PUZZLE_DEBUGGER_LINK = loadConfigurationFromEnv('PUZZLE_DEBUGGER_LINK') || '/static/puzzle.min.js';
export const PUZZLE_LIB_LINK = loadConfigurationFromEnv('PUZZLE_LIB_LINK') || "/static/puzzle.min.js";
export const DEBUG_INFORMATION = loadConfigurationFromEnv('DEBUG_INFORMATION') || process.env.NODE_ENV !== 'production' || false;
export const NO_COMPRESS_QUERY_NAME = loadConfigurationFromEnv('NO_COMPRESS_QUERY_NAME') || '__noCompress';
export const NON_SELF_CLOSING_TAGS = ['div', 'span', 'p'];
export const PUZZLE_MAX_SOCKETS = +loadConfigurationFromEnv('MAX_SOCKETS') || Infinity;
export const KEEP_ALIVE_MSECS = +loadConfigurationFromEnv('KEEP_ALIVE_MSECS') || 1000;
export const EXTERNAL_STYLE_SHEETS = loadConfigurationFromEnv("EXTERNAL_STYLE_SHEETS") || false;
export const CSS_ASSETS_ASYNC_LOAD_ENABLED = loadConfigurationFromEnv("CSS_ASSETS_ASYNC_LOAD_ENABLED") || false;


export const USE_HELMET = loadConfigurationFromEnv('USE_HELMET') || false;
export const USE_MORGAN = loadConfigurationFromEnv('USE_MORGAN') || false;
export const BROTLI = loadConfigurationFromEnv('BROTLI') || false;
export const CIRCUIT_ENABLED = loadConfigurationFromEnv("CIRCUIT_ENABLED") || false;

export const SENTRY_PATH = loadConfigurationFromEnv("SENTRY_PATH") || "ws://127.0.0.1:4400";

export const TEMP_FOLDER = path.join(process.cwd(), '/~temp');

export const PEERS = loadConfigurationFromEnv("PEERS") ? JSON.parse(loadConfigurationFromEnv("PEERS")): [];
export const GUN_PATH = loadConfigurationFromEnv('GUN_PATH') || 'https://static.dsmcdn.com/frontend/mobileweb/production/gun.js';

export const SATISFY_COMPILE_AMOUNT = 5;
