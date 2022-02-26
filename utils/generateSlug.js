const slugify = require("slugify");

const Phone = require("../models/Phone");

module.exports = async (name) => {
    let slug =
        slugify(name, {
            replacement: "_", // replace spaces with replacement character, defaults to `-`
            remove: undefined, // remove characters that match regex, defaults to `undefined`
            lower: true, // convert to lower case, defaults to `false`
            trim: true, // trim leading and trailing replacement chars, defaults to `true`
        }) +
        "_" +
        parseInt(Math.floor(Math.random() * 9000) + 1000);

    const slugUsed = await Phone.findOne({ slug });

    if (slugUsed) {
        slug = await generateSlug(name);
    }

    return slug;
};
