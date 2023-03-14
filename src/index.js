const express = require('express')
const app = express()
const bodyParser = require("body-parser");
const port = 8080
const { tallySchema } = require('./schema')
app.use(bodyParser.urlencoded({ extended: false }))
// Parse JSON bodies (as sent by API clients)
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
const { connection } = require('./connector')

// app.get('/totalRecovered', async (req, res) => {
//     // Add code to calculate total recovered patients across all states
//     const collection = db.collection('covid');
//     const result = await collection.aggregate([
//       {
//         $group: {
//           _id: 'total',
//           recovered: { $sum: '$recovered' }
//         }
//       },
//       {
//         $project: {
//           _id: 0,
//           recovered: 1
//         }
//       }
//     ]).toArray();
//     res.json({ data: result[0] });
//   });


//   app.get('/totalActive', (req, res) => {
//     // Add code to calculate total active patients across all states
//   });

//   app.get('/totalDeath', (req, res) => {
//     // Add code to calculate total deaths across all states
//   });

//   app.get('/hotspotStates', (req, res) => {
//     // Add code to find all hotspot states
//   });

//   app.get('/healthyStates', (req, res) => {
//     // Add code to find all healthy states
//   });



app.get('/', (req, res) => {

    res.send("Covid Statistics is live")
})


app.get('/totalRecovered', async (req, res) => {

    try {
        const data = await connection.find();
        let total = 0;
        for (i = 0; i < data.length; i++) {
            total += data[i].recovered
        }
        res.status(200).json({
            data: { _id: "total", recovered: total },

        })
    } catch (error) {
        res.status(500).json({
            sta: "failed",
            message: error.message
        })
    }

})




app.get('/totalActive', async (req, res) => {

    try {
        const data = await connection.find();
        let totalRecovered = 0;
        let totalInfected = 0;
        for (i = 0; i < data.length; i++) {
            totalRecovered += data[i].recovered
            totalInfected += data[i].infected
        }
        const active = totalInfected - totalRecovered
        res.status(200).json({
            data: { _id: "total", active },

        })
    } catch (error) {
        res.status(500).json({
            sta: "failed",
            message: error.message
        })
    }

})


app.get('/totalDeath', async (req, res) => {

    try {
        const data = await connection.find();
        let death = 0;
        for (i = 0; i < data.length; i++) {
            death += data[i].death
        }
        res.status(200).json({
            data: { _id: "total", death },

        })
    } catch (error) {
        res.status(500).json({
            sta: "failed",
            message: error.message
        })
    }

})


app.get('/hotspotStates', async (req, res) => {

    try {
        const covidData = await connection.find();
        let recovered = 0;
        let infected = 0;
        const data = []
        for (i = 0; i < covidData.length; i++) {
            recovered = covidData[i].recovered
            infected = covidData[i].infected
            rateValue = ((infected - recovered) / infected)

            if (rateValue > (0.1)) {
                rateValue = rateValue.toFixed(5);
        
                data.push({ state: covidData[i].state, rate: rateValue });
            }
        }

        res.status(200).json({
            data

        })
    } catch (error) {
        res.status(500).json({
            sta: "failed",
            message: error.message
        })
    }

})




app.get("/healthyStates", async (req,res) => {
    try {
      // it returns us the entire data base
      const data = await connection.find();
      const states=[];
      for (i = 0; i < data.length; i++) {
        //calculate here death/infected
        let mortality = data[i].death / data[i].infected;
        //  here above we got morality rate
        if (mortality < 0.005) {
          states.push({state:data[i].state,mortality:mortality});
        }
      }
      res.status(200).json({
        data:states,
      });
    } catch (error) {
      res.status(500).json({
        sta: "failed",
        message: error.message,
      });
    }
  });

app.listen(port, () => console.log(`App listening on port ${port}!`))

module.exports = app;