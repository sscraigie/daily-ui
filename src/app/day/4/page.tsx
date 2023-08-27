//Inspiration:
"use client";
import React, { useState } from "react";
import { Grid, Typography, Button } from "@mui/material";
import CalcButton from "./components/CalcButton";

export default function Calculator() {
  const [result, setResult] = useState(0);
  const [display, setDisplay] = useState("1,984");

  const doCalculation = (value: string) => {};

  return (
    <Grid
      container
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
      }}
    >
      <Grid
        item
        container
        sx={{
          backgroundColor: "black",
          flexDirection: "column",
          width: 300,
          height: 600,
        }}
      >
        <Grid
          item
          sx={{
            width: "100%",
            height: "30%",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "flex-end",
            p: 2,
          }}
        >
          <Typography variant="h2" sx={{ color: "white" }}>
            {display}
          </Typography>
        </Grid>
        <Grid
          item
          container
          sx={{
            // backgroundColor: "red",
            width: "100%",
            height: "70%",
            p: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CalcButton type="action" value="C" />
          <CalcButton type="action" value="-/+" />
          <CalcButton type="action" value="%" />
          <CalcButton type="operation" value="÷" />

          <CalcButton type="number" value="7" />
          <CalcButton type="number" value="8" />
          <CalcButton type="number" value="9" />
          <CalcButton type="operation" value="x" />

          <CalcButton type="number" value="4" />
          <CalcButton type="number" value="5" />
          <CalcButton type="number" value="6" />
          <CalcButton type="operation" value="-" />

          <CalcButton type="number" value="1" />
          <CalcButton type="number" value="2" />
          <CalcButton type="number" value="3" />
          <CalcButton type="operation" value="+" />

          <CalcButton type="number" value="0" />
          <CalcButton type="number" value=" " />
          <CalcButton type="number" value="." />
          <CalcButton type="operation" value="=" />
        </Grid>
      </Grid>
    </Grid>
  );
}
