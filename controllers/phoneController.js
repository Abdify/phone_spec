const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Phone = require("../models/Phone");
const generateSlug = require("../utils/generateSlug");
const axios = require("axios");
const PhoneList = require("../models/PhoneList");
const PhoneDetails = require("../models/PhoneDetails");

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach((el) => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};

exports.getPhone = catchAsync(async (req, res, next) => {
    const { slug } = req.params;

    const phone = await PhoneDetails.findOne({ slug }).select("-_id -__v");

    if (!phone)
        return res.status(200).json({
            status: "fail",
            message: `No phone found for ${slug}`,
        });

    res.status(200).json({
        status: "success",
        data: phone,
    });
});

exports.searchPhones = catchAsync(async (req, res, next) => {
    const { q } = req.query;

    const phones = await PhoneList.fuzzySearch(q).select("-_id -__v -confidenceScore -detail").limit(50);

    if (!phones?.length)
        return res.status(200).json({
            status: "fail",
            message: `No phone found for ${q}`,
        });

    res.status(200).json({
        status: "success",
        data: {
            phones,
        },
    });
});

exports.addPhoneDetailsFromList = catchAsync(async (req, res, next) => {
    const phoneList = await PhoneList.find().limit(200);

    if (!phoneList?.length) return next(new AppError(`No phone found, 400`));

    let phones = [];

    for await (let phone of phoneList) {
        const { data } = await axios.get(phone.detail);

        phones.push({ ...data.data, slug: phone.slug });

        console.log(data.data.phone_name);
    }

    const newPhones = await Phone.create(phones);

    if (!newPhones) return next(new AppError(`Couldn't add phones`));

    res.status(200).json({
        status: "success",
        count: phones.length,
    });
});

exports.addFormattedPhoneDetails = catchAsync(async (req, res, next) => {
    const phoneList = await PhoneList.find().limit(200);

    if (!phoneList?.length) return next(new AppError(`No phone found, 400`));

    let phones = [];

    for await (let phone of phoneList) {
        const { data: { data } } = await axios.get(phone.detail);
        let mainFeatures = {
            // chipSet: data.specifications[4].specs[1].val[0],
            // memory: data.specifications[5].specs[1].val[0],
            // displaySize: data.specifications[3].specs[1].val[0],
            storage: data.storage,
        };
        let others = {};
        try {
            for(let info of data.specifications){
                if(info.title === "Display"){
                    const spec = info.specs.find(s => s.key === "Size");
                    mainFeatures.displaySize = spec?.val[0];
                }
                else if(info.title === "Platform"){
                    const spec = info.specs.find(s => s.key === "Chipset");
                    mainFeatures.chipSet = spec?.val[0];
                }
                else if(info.title === "Memory"){
                    const spec = info.specs?.find(s => s.key === "Internal");
                    mainFeatures.memory = spec?.val[0];
                }
                else if(info.title === "Features"){
                    const spec = info.specs.find(s => s.key === "Sensors");
                    mainFeatures.sensors = spec?.val[0]?.split(", ");
                }
                else if (info.title === "Comms") {
                    info.specs.forEach(s => others[s.key] = s?.val[0]);
                }
            }
    
            const phoneDetails = {
                slug: phone.slug,
                name: data.phone_name,
                releaseDate: data.release_date,
                brand: data.brand,
                image: data.thumbnail,
                mainFeatures,
                others,
            };            
            
            phones.push(phoneDetails);
    
            console.log(phoneDetails.name);
        } catch (error) {
            continue;
        }
    }

    const newPhones = await PhoneDetails.create(phones);

    if (!newPhones) return next(new AppError(`Couldn't add phones`));

    res.status(200).json({
        status: "success",
        data: newPhones,
    });
});

exports.addPhoneList = catchAsync(async (req, res, next) => {
    const { brandSlug } = req.params;

    const { data } = await axios.get(
        `https://api-mobilespecs.azharimm.site/v2/brands/${brandSlug}`
    );

    if(!data?.data?.phones?.length) return next(new AppError(`No phone found for ${brandSlug}, 400`));

    const newPhones = await PhoneList.create(data.data.phones);

    if (!newPhones) return next(new AppError(`Can't add phone due to invalid details, 400`));

    res.status(200).json({
        status: "success",
    });
});

exports.addPhone = catchAsync(async (req, res, next) => {
    const slug = await generateSlug(req.body?.phone_name);

    const newPhone = await Phone.create({ ...req.body, slug });

    if (!newPhone) return next(new AppError(`Can't add phone due to invalid details, 400`));

    res.status(200).json({
        status: "success",
        phone: newPhone,
    });
});
