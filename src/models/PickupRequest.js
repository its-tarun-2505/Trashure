import mongoose from 'mongoose'
const { Schema } = mongoose

const requestSchema = new Schema(
  {
    citizen: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    collector: { type: Schema.Types.ObjectId, ref: 'User' },
    category: { type: String, required: true },
    address: { type: String, required: true },
    latitude: { type: Number },
    longitude: { type: Number },
    scheduledAt: { type: Date, required: true },
    acceptedAt: { type: Date },
    onTheWayAt: { type: Date },
    collectedAt: { type: Date },
    completedAt: { type: Date },
    images: [{ type: String }], 
    status: { type: String, enum: ['pending', 'accepted', 'on-the-way', 'collected', 'pending-completion', 'completed', 'cancelled', 'rejected'], default: 'pending' },
    notes: { type: String },
    weight: { type: Number }, // in kg
    volume: { type: Number }, // in cubic meters
    completionRequestedAt: { type: Date }, // When collector requests completion
    completionApprovedAt: { type: Date }, // When citizen approves completion
    completionNotes: { type: String }, // Notes from collector about the collection
    rejectionFeedback: { type: String }, // Feedback from citizen when rejecting completion
    rejectedAt: { type: Date }, // When completion was rejected
    rejectedBy: { type: Schema.Types.ObjectId, ref: 'User' } // Who rejected the completion
  },
  { timestamps: true }
)

const PickupRequest = mongoose.models.PickupRequest || mongoose.model('PickupRequest', requestSchema)
export default PickupRequest