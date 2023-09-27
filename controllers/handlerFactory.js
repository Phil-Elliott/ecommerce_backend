import { catchAsync } from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import APIFeatures from "../utils/apiFeatures.js";

export function deleteOne(Model) {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    console.log(doc);

    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  });
}

export function updateOne(Model) {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });
}

export function createOne(Model) {
  return catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(req.body);

    res.status(201).json({
      status: "success",
      data: {
        data: newDoc,
      },
    });
  });
}

export function getOne(Model, popOptions) {
  return catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);

    if (popOptions) query = query.populate(popOptions);

    const doc = await query;

    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });
}

// export function getAll(Model) {
//   return catchAsync(async (req, res, next) => {
//     // To allow for nested GET reviews on game
//     let filter = {};
//     if (req.params.gameId) filter = { game: req.params.gameId };

//     // Create a separate query to get the total count of all products
//     const totalProductsQuery = Model.find(filter);

//     const features = new APIFeatures(Model.find(filter), req.query)
//       .filter()
//       .sort()
//       .limitFields()
//       .paginate();

//     // Execute both queries in parallel
//     const [docs, totalProducts] = await Promise.all([
//       features.query,
//       totalProductsQuery.countDocuments(),
//     ]);

//     res.status(200).json({
//       status: "success",
//       results: docs.length,
//       totalProducts: totalProducts, // Add the total count of all products to the response
//       data: {
//         data: docs,
//       },
//     });
//   });
// }

export function getAll(Model) {
  return catchAsync(async (req, res, next) => {
    // To allow for nested GET reviews on game
    let filter = {};
    if (req.params.gameId) filter = { game: req.params.gameId };

    // Handle search by name
    if (req.query.search) {
      filter.name = { $regex: req.query.search, $options: "i" };
    }

    // Handle multiple values for category
    if (req.query.category) {
      const categories = req.query.category.split(",").map((cat) => cat.trim());
      filter.category = { $in: categories };
    }

    // Handle multiple values for publisher
    if (req.query.publisher) {
      const publishers = req.query.publisher
        .split(",")
        .map((cat) => cat.trim());
      filter.publisher = { $in: publishers };
    }

    // Handle multiple values for gameModes
    if (req.query.gameModes) {
      const gameModes = req.query.gameModes.split(",").map((cat) => cat.trim());
      filter.gameModes = { $in: gameModes };
    }

    // Handle multiple values for platform
    if (req.query.platform) {
      const platforms = req.query.platform.split(",").map((cat) => cat.trim());
      filter.platform = { $in: platforms };
    }

    // Handle multiple values for prices
    if (req.query.prices) {
      const prices = req.query.prices.split(",");
      const priceFilters = prices.map((price) => {
        const priceParts = price.split("-");
        if (priceParts.length === 1) {
          const cleanedPricePart = priceParts[0]
            .replace(/[$,]/g, "")
            .replace("Over", "")
            .trim();
          return { price: { $gt: parseInt(cleanedPricePart, 10) } };
        } else {
          const lowerLimit = parseInt(
            priceParts[0].replace(/[$,]/g, "").trim(),
            10
          );
          const upperLimit = parseInt(
            priceParts[1].replace(/[$,]/g, "").trim(),
            10
          );
          return { price: { $gte: lowerLimit, $lte: upperLimit } };
        }
      });
      filter.$or = priceFilters;
    }

    // Create a separate query to get the total count of all products
    const totalProductsQuery = Model.find(filter);

    const features = new APIFeatures(Model, filter, req.query)
      .sort()
      .limitFields()
      .paginate();

    // Execute both queries in parallel
    const [docs, totalProducts] = await Promise.all([
      features.query,
      totalProductsQuery.countDocuments(),
    ]);

    res.status(200).json({
      status: "success",
      results: docs.length,
      totalProducts: totalProducts,
      data: {
        data: docs,
      },
    });
  });
}
