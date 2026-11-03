const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;

const parsePagination = (query) => {
    if (query.page === undefined && query.limit === undefined) {
        return null;
    }

    const parsePositiveInteger = (value) => {
        if (typeof value !== "string" || !/^\d+$/.test(value)) {
            return null;
        }
        const parsed = Number(value);
        return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
    };

    const page = query.page === undefined ? 1 : parsePositiveInteger(query.page);
    const limit = query.limit === undefined
        ? DEFAULT_PAGE_SIZE
        : parsePositiveInteger(query.limit);
    if (!page || !limit || limit > MAX_PAGE_SIZE) {
        return { error: "page must be a positive integer and limit must be between 1 and 100" };
    }

    const skip = (page - 1) * limit;
    if (!Number.isSafeInteger(skip)) {
        return { error: "page is too large" };
    }

    return { page, limit, skip };
};

const paginateQuery = async ({ model, filter, query, pagination, res }) => {
    const [total, items] = await Promise.all([
        model.countDocuments(filter),
        query.skip(pagination.skip).limit(pagination.limit).exec(),
    ]);

    res.set({
        "X-Total-Count": String(total),
        "X-Page": String(pagination.page),
        "X-Limit": String(pagination.limit),
        "X-Total-Pages": String(Math.ceil(total / pagination.limit)),
    });

    return items;
};

module.exports = { parsePagination, paginateQuery };
