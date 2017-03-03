'use strict';

const expect =  require('chai').expect;
const request = require('superagent');
const Food = require('../model/food.js');
const PORT = process.env.PORT || 3000;

// process.env.MONGOL_URI = 'mongodb://localhost/foodapp';

require('../server.js');

const url = `http://localhost:${PORT}`;
const exampleFood = {
  name: 'test food name',
  meal: 'Breakfast',
  timestamp: new Date()
};

const exampleSalad = {
  name: 'test salad name',
  dressing: 'ceaser',
  timestamp: new Date()
};

describe('Food Routes', function() {
  describe('POST: /api/food', function() {
    describe('with a valid body', function(){
      after( done => {
        if (this.tempFood) {
          Food.remove({})
          .then( () => done())
          .catch(done);
          return;
        }
        done();
      });
      it('should return a food', done => {
        request.post(`${url}/api/food`)
        .send(exampleFood)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body.name).to.equal('test food name');
          expect(res.body.meal).to.equal('Breakfast');
          this.tempFood = res.body;
          done();
        });
      });
    });

    describe('with an invalid body', function() {
      it('should return 400', done => {
        request.post(`${url}/api/food`)
        .send({})
        // ???
        .end((err, res) => {
          expect(res.status).to.equal(400);
          done();
        });
      });
    });
  });
  describe('GET: /api/food/:id', function() {
    describe('with a valid body', function() {
      before( done  => {
        exampleFood.timestamp = new Date();
        new Food(exampleFood).save()
        .then( food => {
          this.tempFood = food;
          return Food.findByIdAndAddSalad(food._id, exampleSalad);
        })
        .then( salad => {
          this.tempSalad = salad;
          done();
        })
        .catch(done);
      });

      after(done => {
        delete exampleFood.timestamp;
        if(this.tempFood) {
          Food.remove({})
          .then( () => done())
          .catch(done);
          return;
        }
        done();
      });

      it('should return a food', done => {
        request.get(`${url}/api/food/${this.tempFood._id}`)
        .end((err, res) => {
          if(err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.name).to.equal('test food name');
          expect(res.body.meal).to.equal('Breakfast');
          expect(res.body.salads.length).to.equal(1);
          expect(res.body.salads[0].name).to.equal(exampleSalad.name);
          done();
        });
      });
    });
    describe('with an invalid request', function() {
      it('should respond with 404', done => {
        request.get(`${url}/api/fo`)
        .end(res => {
          expect(res.status).to.equal(404);
          done();
        });
      });
    });
  });
  describe('PUT: /api/food/:id', function() {
    describe('with a valid body', function() {
      before( done => {
        new Food(exampleFood).save()
         .then( food => {
           this.tempFood = food;
           done();
         })
         .catch(done);
      });
      after( done => {
        if(this.tempFood) {
          Food.remove({})
          .then( () => done())
          .catch(done);
          return;
        }
        done();
      });
      it('should respond with 200', done => {
        request.put(`${url}/api/food/${this.tempFood._id}`)
          .send({name: 'new name', meal:'lunch'})
          .end( (err, res) => {
            if(err) return done(err);
            let timestamp = new Date();
            expect(res.status).to.equal(200);
            expect(res.body.name).to.equal('new name');
            expect(timestamp.toString()).to.equal(exampleFood.timestamp.toString());
            done();
          });
      });
    });
    describe('with an invalid body', function() {
      it('should respond with 404', done => {
        request.put(`${url}/api/fo`)
        .end(res => {
          expect(res.status).to.equal(404);
          done();
        });
      });
    });
  });
});
