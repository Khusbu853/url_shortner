const crypto = require('crypto');
const Url = require('../models/urlModels');

const CODE_LENGTH = 7;
const CODE_CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
// Custom alias: 3-30 chars, letters, numbers, "-" and "_"
const ALIAS_REGEX = /^[a-zA-Z0-9_-]{3,30}$/;
// Aliases that would clash with the app's own routes
const RESERVED_ALIASES = ['api', 'health'];

const generateCode = () => {
    let code = '';
    for (let i = 0; i < CODE_LENGTH; i++) {
        code += CODE_CHARS[crypto.randomInt(CODE_CHARS.length)];
    }
    return code;
};

const isValidUrl = (value) => {
    try {
        const url = new URL(value);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
};

const baseUrl = (req) => process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;

// POST /api/url/shorten
// body: { originalUrl, customAlias?, expirationDate? }
const createShortUrl = async (req, res) => {
    const { originalUrl, customAlias, expirationDate } = req.body || {};

    if (!originalUrl || !isValidUrl(originalUrl)) {
        return res.status(400).json({ message: 'A valid http(s) originalUrl is required' });
    }

    let expiry = null;
    if (expirationDate) {
        expiry = new Date(expirationDate);
        if (isNaN(expiry.getTime()) || expiry <= new Date()) {
            return res.status(400).json({ message: 'expirationDate must be a valid future date' });
        }
    }

    let shortCode;

    if (customAlias) {
        shortCode = String(customAlias).trim();

        if (!ALIAS_REGEX.test(shortCode)) {
            return res.status(400).json({
                message: 'customAlias must be 3-30 characters: letters, numbers, "-" or "_"'
            });
        }
        if (RESERVED_ALIASES.includes(shortCode.toLowerCase())) {
            return res.status(400).json({ message: 'This alias is reserved' });
        }
        if (await Url.exists({ shortCode })) {
            return res.status(409).json({ message: 'This alias is already taken' });
        }
    } else {
        do {
            shortCode = generateCode();
        } while (await Url.exists({ shortCode }));
    }

    let url;
    try {
        url = await Url.create({
            shortCode,
            originalUrl,
            isCustom: Boolean(customAlias),
            expirationDate: expiry
        });
    } catch (error) {
        // Two requests raced for the same alias; the unique index rejected the second
        if (error.code === 11000) {
            return res.status(409).json({ message: 'This alias is already taken' });
        }
        throw error;
    }

    return res.status(201).json({
        id: url._id,
        originalUrl: url.originalUrl,
        shortCode: url.shortCode,
        shortUrl: `${baseUrl(req)}/${url.shortCode}`,
        isCustom: url.isCustom,
        clicks: url.clicks,
        expirationDate: url.expirationDate,
        createdAt: url.createdAt
    });
};

// GET /:code
const redirectToOriginal = async (req, res) => {
    const url = await Url.findOne({ shortCode: req.params.code });
    if (!url) {
        return res.status(404).json({ message: 'Short URL not found' });
    }
    if (url.expirationDate && url.expirationDate < new Date()) {
        return res.status(410).json({ message: 'This short URL has expired' });
    }

    await Url.updateOne({ _id: url._id }, { $inc: { clicks: 1 } });
    res.redirect(url.originalUrl);
};

module.exports = {
    createShortUrl,
    redirectToOriginal
};
