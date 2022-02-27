const User = require("../models/User");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Phone = require("../models/Phone");
const generateSlug = require("../utils/generateSlug");
const axios = require("axios");
const PhoneList = require("../models/PhoneList");

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach((el) => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};

exports.getPhone = catchAsync(async (req, res, next) => {
    const { slug } = req.params;

    const phone = await Phone.findOne({ slug }).select("-_id -__v");

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
    const phones = await PhoneList.fuzzySearch(q).select("-_id -__v -confidenceScore -detail");

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
    const phoneList = await PhoneList.find();

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

exports.addPhoneList = catchAsync(async (req, res, next) => {
    const { brandSlug } = req.params;
    
    const { data } = await axios.get(
        `https://api-mobilespecs.azharimm.site/v2/brands/${brandSlug}`
    );

    const newPhones = await PhoneList.create(data.data.phones);

    if (!newPhones)
        return next(
            new AppError(`
      Can't add phone due to invalid details, 400
      `)
        );

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

exports.updateUser = catchAsync(async (req, res, next) => {
    // 1) Create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
        return next(
            new AppError(
                "This route is not for password updates. Please use /updateMyPassword.",
                400
            )
        );
    }

    // 2) Filtered out unwanted fields names that are not allowed to be updated
    //   const filteredBody = filterObj(req.body, 'name', 'email');

    // 3) Update user document
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        status: "success",
        user: updatedUser,
    });
});

exports.getMe = catchAsync(async (req, res, next) => {
    req.params.id = req.user._id;
    next();
});

exports.getUser = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) return next(new AppError(`No User found against id ${req.params.id}`, 404));

    res.status(200).json({
        status: "success",
        user,
    });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) return next(new AppError(`No User found against id ${req.params.id}`, 404));

    res.status(200).json({
        status: "success",
        user: deletedUser,
    });
});
