module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next); //wraps around async functions and calls the async function within
    }
}