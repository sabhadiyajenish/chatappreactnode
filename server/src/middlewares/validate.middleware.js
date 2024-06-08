import { ApiError } from "../utils/ApiError.js";
const validate = (schema) => async (req, res, next) => {
    try {
        const parseBody = await schema.parseAsync(req.body);
        req.body = parseBody;
        next();
    } catch (err) {
        console.log(err);
        res.status(400).json(new ApiError(400, err.errors[0].message, err.errors[0]));
    }
}

export { validate };