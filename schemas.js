const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({ //removes script or html from inputs
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': 'Invalid input for {{#label}}. Please try again.'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});
const Joi = BaseJoi.extend(extension)


module.exports.taskSchema = Joi.object({
    task: Joi.object({
        name: Joi.string()
            .required()
            .escapeHTML(),
        priority: Joi.string()
            .required()
            .valid('low', 'medium', 'high')
            .escapeHTML(),
        description: Joi.string()
            .required()
            .escapeHTML(),
        deadline: Joi.date()
            .min(new Date())
            .allow('')
    }).required(),
});



