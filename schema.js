const Joi = require("joi")

module.exports.listingSchema = Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        // removed duplicate description line
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.object({
                url: Joi.string(),
                filename: Joi.string()
        }).optional(),
        category: Joi.string().required()
})

module.exports.reviewSchema = Joi.object({
        review: Joi.object({
                comment: Joi.string().required(),
                rating: Joi.number().required().min(1).max(5),
                created_at: Joi.date(),          // ← added ()
        }).required()   
})

