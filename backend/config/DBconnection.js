const mongoose = require('mongoose')
const uri = process.env.MONGIDB_URI;

const connect = async () => {
    try {
        await mongoose.connect(uri);
        console.log("Succsfully connected to Mongodb")
    } catch (error) {
        console.log(error)
    }
}

module.exports = connect;