const fetch = require('node-fetch');
const model = require('./models');
const jwt = require('jsonwebtoken')

exports.create = async(req, res, next) => {
    const { title } = req.body;
    if (!req.body || !title) {
        return res.status(400).json({ error: 'invalid payload' });
    }
    try {
        let response = await fetch(`http://www.omdbapi.com/?t=${title}`);
        let json = await response.json();
        if (json.Response === 'True') {
            let movie = await new model();
            movie.title = json.Title;
            movie.released = json.Released;
            movie.genre = json.Genre;
            movie.director = json.Director;
            movie.userId = req.user.userId;
            movie.save((err, result) => {
                if (err) {
                    console.log(err);
                } else {
                    res.json(result)
                }
            });
        } else {
            return res.status(404).json({ error: json });
        }
    } catch (err) {
        if (err) {
            return res.status(400).json({ error: error });
        }
        next(err);
    }
}

exports.list = async(req, res, next) => {
    try {
        model.find({userId: req.user.userId}).exec((err, data) => {
            if (err) {
                console.log(err);
            } else {
                res.json(data);
            }
        });
    } catch (err) {
        if (err) {
            return res.status(401).json({ error: error });
        }
        next(err);
    }
}

exports.role = (req, res, next) => {
    if (req.user.role === 'basic') {
        const userId = req.user.userId;
        let date = new Date();
        model.find({
            $and: [
                {
                createdAt: 
                    {
                        $gte: new Date(date.getFullYear(), date.getMonth(), 1),
                        $lte: new Date(date.getFullYear(), date.getMonth() + 1, 0),
                    },
                },
                { userId: userId },
            ],
        }).countDocuments((err, count) => {
            if (count >= 5) {
                return res
                    .status(400)
                    .json('Monthly limit');
            } else {
                next();
            }
        });
    } else {
        next()
    }
}

exports.token = (req, res, next) => {
    if (!req.headers['authorization']) {
        return res.status(401).json('Not logged in');
    }
    const authorization = req.headers['authorization'];
    const ttoken = authorization.split(' ');
    const token = ttoken[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
        if (err) {
            return res.status(401).json('Not logged in');
        }
        req.user = payload
        next()
    })
}
