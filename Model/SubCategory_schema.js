import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const SubCategorySchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    // description: {
    //     type: String,
    //     trim: true
    // },
    category_id: {
        type: Schema.Types.ObjectId,
        ref: 'Categories',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

export const subCategoryModel = mongoose.model('subcategories', SubCategorySchema);