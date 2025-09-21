import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const { Schema } = mongoose

const userSchema = new Schema(
  {
    role: {
      type: String,
      enum: ['admin', 'citizen', 'collector'],
      required: true
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    password: { type: String, required: true },
    photoUrl: { type: String, default: '' },
    // Location fields for collectors
    latitude: { 
      type: Number, 
      required: function() { return this.role === 'collector' },
      min: -90,
      max: 90
    },
    longitude: { 
      type: Number, 
      required: function() { return this.role === 'collector' },
      min: -180,
      max: 180
    }
  },
  { timestamps: true }
)

// Hash password before save if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    return next()
  } catch (err) {
    return next(err)
  }
})

// Remove sensitive fields when converting to JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.password
  return obj
}

const User = mongoose.models.User || mongoose.model('User', userSchema)
export default User