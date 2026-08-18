const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    plan:{
        type:String,
    },
    amount:{
        type:Number,
        required:true,
    },
    transactionId:{
    type:String,
    required:true,
},
paymentStatus: {
    type: String,
    required: true,
},
},
{
    timestamps: true,
}
);

module.exports = mongoose.model("Payments", PaymentSchema);