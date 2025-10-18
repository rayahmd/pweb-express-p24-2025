"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
router.get("/pizza", (_, res) => {
    res.status(200).send("yummy pizza enak");
});
router.get("/cookie", (_, res) => {
    res.status(200).send("yummy coookiees enak");
});
router.get("/donut", (_, res) => {
    res.status(200).send("ddoooo nutttt enak");
});
exports.default = router;
//# sourceMappingURL=food.router.js.map