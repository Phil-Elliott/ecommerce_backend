import mongoose from "mongoose";
import dotenv from "dotenv";
import Review from "./models/reviewModel.js";
import User from "./models/userModel.js";

dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

if (!process.env.DATABASE_PASSWORD || !DB) {
  console.error("Missing required environment variables");
  process.exit(1);
}

const userIds = [
  "64781d2740fa59e9a3b1b618",
  "64ab4b8cd430e371dc6977a3",
  "64bb7dd61b195dd033fcaec3",
  "64c0bccc1c3659a37f32276d",
  "64c0bccc1c3659a37f322771",
  "64c0bccc1c3659a37f322769",
  "64c0bccc1c3659a37f32276c",
  "64c0bccc1c3659a37f32276f",
  "64c0bccc1c3659a37f322768",
  "64c0bccc1c3659a37f322770",
  "64c0bccc1c3659a37f32276e",
  "64c0bccc1c3659a37f32276b",
  "64c0bccc1c3659a37f322774",
  "64c0bccc1c3659a37f322773",
  "64c0bccc1c3659a37f322778",
  "64c0bccc1c3659a37f32276a",
  "64c0bccc1c3659a37f322776",
  "64c0bccc1c3659a37f322772",
  "64c0bccc1c3659a37f322777",
  "64c0bccc1c3659a37f322779",
  "64c0bccc1c3659a37f32277a",
  "64c0bccc1c3659a37f32277b",
  "64c0bccc1c3659a37f322775",
];

function getRandomSubarray(arr, size) {
  const shuffled = arr.slice(0);
  let i = arr.length;
  while (i--) {
    const index = Math.floor((i + 1) * Math.random());
    const temp = shuffled[index];
    shuffled[index] = shuffled[i];
    shuffled[i] = temp;
  }
  return shuffled.slice(0, size);
}

mongoose
  .connect(DB, {
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("DB connection successful!");

    const reviews = await Review.find();

    for (const review of reviews) {
      const upVotesCount = Math.floor(Math.random() * userIds.length);
      const upVoters = getRandomSubarray(userIds, upVotesCount);

      const remainingUserIds = userIds.filter(
        (userId) => !upVoters.includes(userId)
      );
      const downVotesCount = Math.floor(
        Math.random() * remainingUserIds.length
      );
      const downVoters = getRandomSubarray(remainingUserIds, downVotesCount);

      review.upVotes = upVoters;
      review.downVotes = downVoters;

      await review.save();
    }

    console.log("All reviews updated successfully with random votes");

    mongoose.connection.close();
  })
  .catch((err) => {
    console.error("DB connection error:", err);
    process.exit(1);
  });
