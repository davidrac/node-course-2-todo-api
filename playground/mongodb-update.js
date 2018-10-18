const { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/test/TodoApp', { useNewUrlParser: true }, (err, client) => {
    if (err) {
        return console.log('Unable to connect to MongoDB server');
    }
    console.log('Connected to MongoDB server');
    const db = client.db('TodoApp');

    // db.collection('Todos').findOneAndUpdate({
    //     _id: new ObjectID('5bc753bcdd226505692df186')
    // }, {
    //         $set: {
    //             completed: true
    //         }
    //     }, {
    //         returnOriginal: false
    //     }).then(result => {
    //         console.log(result);
    //     });

    db.collection('Users').findOneAndUpdate({
        _id: new ObjectID('5bc72c123c8803ab5f95a47e')
    }, {
            $set: { name: 'David' },
            $inc: { age: 17 }
        }, {
            returnOriginal: false
        }).then(console.log, console.log);

    client.close();
});