"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const ReviewSchema = new mongoose_1.Schema({
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: [true, "Please provide rating"],
    },
    title: {
        type: String,
        trim: true,
        required: [true, "Please provide  review title"],
        maxlength: 100,
    },
    comment: {
        type: String,
        required: [true, "Please provide review text"],
    },
    user: {
        type: mongoose_1.default.Types.ObjectId,
        ref: "User",
        required: true,
    },
    product: {
        type: mongoose_1.default.Types.ObjectId,
        ref: "Product",
        required: true,
    },
}, { timestamps: true });
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });
ReviewSchema.statics.calculateAverageRating = function (productId) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield this.aggregate([
            {
                $match: {
                    product: productId,
                },
            },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: "$rating" },
                    numOfReviews: { $sum: 1 },
                },
            },
        ]);
        try {
            yield this.constructor.model("Product").findOneAndUpdate({ _id: productId }, {
                averageRating: Math.ceil(((_a = result[0]) === null || _a === void 0 ? void 0 : _a.averageRating) || 0),
                numOfReviews: ((_b = result[0]) === null || _b === void 0 ? void 0 : _b.numOfReviews) || 0,
            });
        }
        catch (error) {
            console.log(error);
        }
    });
};
ReviewSchema.post("save", function () {
    return __awaiter(this, void 0, void 0, function* () {
        yield this.constructor.calculateAverageRating(this.product);
    });
});
ReviewSchema.post("remove", function () {
    return __awaiter(this, void 0, void 0, function* () {
        yield this.constructor.calculateAverageRating(this.product);
    });
});
exports.default = mongoose_1.default.model("Review", ReviewSchema);
