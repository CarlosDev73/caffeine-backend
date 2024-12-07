import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  userName:{
    type: String,
    require: true,
    unique: true,
    trim: true,
    lowercase: true,
    maxlength: 60
  },
  displayName:{
    type: String,
    require: true,
    trim: true,
    lowercase: true,
    maxlength: 20,
    minlength: 1
  },
  email:{
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    maxlength: 60,
  },
  password:{
    type: String,
    required:true
  },
  points: {
    type: Number,
    default: 0, 
    min: 0,
  },
  level: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Level',
    default: null,
  },
  phone:{
    type: String
  },
  country:{
    type: String
  },
  skills:{
    type:[String]
  },
  biography:{
    type: String 
  },
  followers:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  following:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  profileImg:{
    public_id: String,
    secure_url: String
  },
  coverImg:{
    type: String,
    default: ""
  }

},
{
  timestamps: true // con eso agregamos de manera automatica createdAt y updatedAt
});

export default mongoose.model('User',userSchema) 

