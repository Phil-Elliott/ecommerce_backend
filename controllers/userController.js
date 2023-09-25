import User from "../models/userModel.js";
import * as factory from "./handlerFactory.js";
import { catchAsync } from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });

  return newObj;
};

export const updateMe = catchAsync(async (req, res, next) => {
  console.log(req.body);

  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "This route is not for password updates. Please use /updatePassword",
        400
      )
    );
  }

  // Define allowed fields for address
  const allowedAddressFields = [
    "streetAddress",
    "city",
    "state",
    "postalCode",
    "country",
  ];

  // Extracting and filtering address object from the body
  let addressObj = {};
  if (req.body.address) {
    addressObj = Object.keys(req.body.address)
      .filter((key) => allowedAddressFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = req.body.address[key];
        return obj;
      }, {});
  }

  // Filter out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(
    req.body,
    "name",
    "email",
    "avatar",
    "phoneNumber"
  );

  // Assigning the filtered address object back to the filtered body
  if (Object.keys(addressObj).length > 0) filteredBody.address = addressObj;

  // Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  // Send response
  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

export const deleteMe = catchAsync(async (req, res, next) => {
  console.log("deleteMe");

  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: "success",
    data: null,
  });
});

export const getMe = catchAsync(async (req, res, next) => {
  req.params.id = req.user.id;
  next();
});

export const getAllUsers = factory.getAll(User);

export const getUserById = factory.getOne(User);

export const updateUser = factory.updateOne(User);

export const deleteUser = factory.deleteOne(User);
