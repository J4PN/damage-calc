const express = require("express");
const calc = require("./calc/dist");

const app = express();

// Render uses dynamic PORT
const PORT = process.env.PORT || 3000;

// Parse JSON body
app.use(express.json());

// Health check route
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Pokemon Showdown damage calc API is running"
  });
});

// Main calc route
app.post("/calculate", (req, res) => {
  try {
    const gen = calc.Generations.get(
      typeof req.body.gen === "undefined" ? 9 : req.body.gen
    );

    let error = "";

    if (typeof req.body.attackingPokemon === "undefined") {
      error +=
        "attackingPokemon must exist and have a valid pokemon name\n";
    }

    if (typeof req.body.defendingPokemon === "undefined") {
      error +=
        "defendingPokemon must exist and have a valid pokemon name\n";
    }

    if (typeof req.body.moveName === "undefined") {
      error += "moveName must exist and be a valid move\n";
    }

    if (error) {
      return res.status(400).json({ error });
    }

    const result = calc.calculate(
      gen,
      new calc.Pokemon(
        gen,
        req.body.attackingPokemon,
        req.body.attackingPokemonOptions || {}
      ),
      new calc.Pokemon(
        gen,
        req.body.defendingPokemon,
        req.body.defendingPokemonOptions || {}
      ),
      new calc.Move(gen, req.body.moveName),
      new calc.Field(req.body.field || {})
    );

    res.json({
      result: result.toString(),
      raw: result
    });
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

// Optional static frontend
app.use(express.static("dist"));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
