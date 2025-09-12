const { Schema, model } = require('mongoose');

const profileSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  scores: {
    R: { type: Number, default: 0 },
    I: { type: Number, default: 0 },
    A: { type: Number, default: 0 },
    S: { type: Number, default: 0 },
    E: { type: Number, default: 0 },
    C: { type: Number, default: 0 }
  },
  rawAnswers: { type: Object, default: {} },
}, { timestamps: true });

module.exports = model('Profile', profileSchema);
