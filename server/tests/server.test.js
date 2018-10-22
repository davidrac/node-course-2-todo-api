const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');
const _ = require('lodash');

const { app } = require('./../server');
const { Todo } = require('./../models/todo');
const { User } = require('./../models/user');
const { todos, populateTodos, users, populateUsers } = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
    it('should create a new todo', done => {
        var text = 'Test todo text';

        request(app)
            .post('/todos')
            .send({ text })
            .expect(200)
            .expect(res => {
                expect(res.body.text).toBe(text);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find({ text }).then(todos => {
                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe(text);
                    done();
                }).catch(e => done(e));
            })
    });

    it('should not crete a todo with invalid body data', done => {
        request(app)
            .post('/todos')
            .send({})
            .expect(400)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find().then(todos => {
                    expect(todos.length).toBe(2);
                    done();
                }).catch(done);
            })
    });
});

describe('GET /todos', () => {
    it('should get all todos', done => {
        request(app)
            .get('/todos')
            .send()
            .expect(200)
            .expect(res => {
                expect(res.body.todos.length).toBe(2);
            }).end(done);
    });
});

describe('GET /todos/:id', () => {
    it('should return todo doc', done => {
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .expect(200)
            .expect(res => {
                expect(res.body.todo.text).toBe(todos[0].text);
            }).end(done);
    });

    it('should return 404 if todo not found', done => {
        request(app)
            .get(`/todos/${new ObjectID().toHexString()}`)
            .expect(404)
            .end(done);
    });

    it('should return 404 for non-object ids', done => {
        request(app)
            .get('/todos/123')
            .expect(404)
            .end(done);
    });
});

describe('DELETE /todos/:id', () => {
    it('should remove a todo', done => {
        var hexId = todos[1]._id.toHexString();

        request(app)
            .delete(`/todos/${hexId}`)
            .expect(200)
            .expect(res => {
                expect(res.body.todo._id).toBe(hexId);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                Todo.findById(hexId).then(todo => {
                    expect(todo).toBeNull();
                    done();
                }).catch(done);
            });
    });

    it('should return 404 if todo not found', done => {
        request(app)
            .delete(`/todos/${new ObjectID().toHexString()}`)
            .expect(404)
            .end(done);
    });

    it('should return 404 if object id is invalid', done => {
        request(app)
            .delete('/todos/123')
            .expect(404)
            .end(done);
    });
});

describe('PATCH /todos/:id', () => {
    it('should update the todo', done => {
        var hexId = todos[0]._id.toHexString();
        var text = 'updated text';
        var completed = true;

        request(app)
            .patch(`/todos/${hexId}`)
            .send({ text, completed })
            .expect(200)
            .expect(res => {
                expect(res.body.todo.text).toBe(text);
                expect(res.body.todo.completed).toBe(true);
                expect(typeof res.body.todo.completedAt).toBe('number');
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                Todo.findById(hexId).then(todo => {
                    expect(todo.text).toBe(text);
                    expect(todo.completed).toBe(true);
                    expect(typeof todo.completedAt).toBe('number');
                    done();
                }).catch(done)
            });
    });

    it('should clear completedAt when todo is not completed', done => {
        var hexId = todos[0]._id.toHexString();
        var text = 'updated text again';
        var completed = false;

        request(app)
            .patch(`/todos/${hexId}`)
            .send({ text, completed })
            .expect(200)
            .expect(res => {
                expect(res.body.todo.text).toBe(text);
                expect(res.body.todo.completed).toBe(false);
                expect(res.body.todo.completedAt).toBeNull();
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                Todo.findById(hexId).then(todo => {
                    expect(todo.text).toBe(text);
                    expect(typeof todo.completed).toBe('boolean');
                    expect(todo.completed).toBe(false);
                    expect(todo.completedAt).toBeNull();
                    done();
                }).catch(done)
            });
    });
});

describe('GET users/me', () => {
    it('should return user if authenticated', done => {
        request(app)
            .get('/users/me')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect(res => {
                expect(res.body._id).toBe(users[0]._id.toHexString());
                expect(res.body.email).toBe(users[0].email);
            })
            .end(done);
    });

    it('should return 401 if not authenticated', done => {
        request(app)
            .get('/users/me')
            .expect(401)
            .expect(res => {
                expect(res.body).toEqual({});
            })
            .end(done);
    });
});

describe('POST /users', () => {
    it('should create a user', done => {
        var email = 'example@example.com';
        var password = '123mnb!';

        request(app)
            .post('/users')
            .send({ email, password })
            .expect(200)
            .expect(res => {
                expect(typeof res.headers['x-auth']).toBe('string');
                expect(typeof res.body._id).toBe('string');
                expect(res.body.email).toBe(email);
            })
            .end(err => {
                if (err) {
                    return done(err);
                }

                User.findOne({ email }).then(user => {
                    expect(user).not.toBeNull();
                    expect(user.password).not.toBe(password);
                    done();
                }).catch(done);
            });
    });

    it('should turn validation errors if request invalid', done => {
        request(app)
            .post('/users')
            .send({ email: 'a', password: 'a' })
            .expect(400)
            .end(done);
    });

    it('should not create user if email in use', done => {
        request(app)
            .post('/users')
            .send({ email: users[0].email, password: 'abc123!' })
            .expect(400)
            .end(done);
    });
});

describe('POST /users/login', () => {
    it('should login user and return auth token', done => {
        request(app)
            .post('/users/login')
            .send({
                email: users[1].email,
                password: users[1].password
            })
            .expect(200)
            .expect(res => {
                expect(typeof res.headers['x-auth']).toBe('string');
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                User.findById(users[1]._id).then(user => {
                    expect(_.pick(user.tokens[0], ['access', 'token'])).toEqual({
                        access: 'auth',
                        token: res.headers['x-auth']
                    });
                    done();
                }).catch(done);
            });
    });

    it('should reject invalid login', done => {
        request(app)
            .post('/users/login')
            .send({
                email: users[1].email,
                password: users[1].password + '1'
            })
            .expect(400)
            .expect(res => {
                expect(res.headers['x-auth']).toBeUndefined();
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                User.findById(users[1]._id).then(user => {
                    expect(user.tokens.length).toBe(0);
                    done();
                }).catch(done);
            });

    });
});

describe('DELETE /users/me/token', () => {
    it('should remove auth token on logout', done => {
        request(app)
            .delete('/users/me/token')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                User.findById(users[0]._id).then(user => {
                    expect(user.tokens.length).toBe(0);
                    done();
                }).catch(done);
            });
    });
});