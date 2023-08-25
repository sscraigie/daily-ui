//Inspiration: https://collectui.com/designers/siara/sign-up
"use client"; //This is for the onSubmit event, but could easily we swapped out for server actions
import React from "react";
import {
  Grid,
  Button,
  TextField,
  Box,
  Typography,
  Stack,
  Checkbox,
  FormControlLabel,
  FormGroup,
} from "@mui/material";
import Image from "next/image";
import Link from "next/link";

export function Form() {
  return (
    <Grid
      container
      item
      spacing={2}
      sx={{ display: "flex", flexDirection: "column" }}
    ></Grid>
  );
}

const handleSubmit = () => {
  alert("Successful Signup!🥳");
};

export default function Day1() {
  return (
    <Grid container sx={{ width: "100vw", height: "100vh" }}>
      <Grid
        xs={12}
        md={6}
        spacing={2}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          padding: "20px",
        }}
        item
      >
        <Typography variant="h5">Welcome!</Typography>
        <Typography variant="subtitle2">
          Sign in by entering the information below
        </Typography>
        <Stack component="form" spacing={2} sx={{ padding: 5, width: "80%" }}>
          <TextField label="Email"></TextField>
          <TextField type="password" label="Password"></TextField>
          <Stack
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
            direction={"row"}
          >
            <FormGroup>
              <FormControlLabel control={<Checkbox />} label={"Remember me"} />
            </FormGroup>
            <Link href="/reset-password"> Forgot Password</Link>
          </Stack>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{ textTransform: "none", backgroundColor: "#6ba1f6" }}
          >
            Continue
          </Button>
          <Typography>
            Don&apos;t have an account?
            <Link href={"/sign-up"}> Create one here.</Link>
          </Typography>
        </Stack>
      </Grid>
      <Grid md={6} sx={{ display: { xs: "none", md: "block" }, width: "100%" }}>
        <Image
          width={500}
          height={500}
          style={{
            objectFit: "cover",
            minWidth: "100%",
            maxWidth: "100%",
            height: "100vh",
          }}
          alt="hills"
          src="/d1/hills.png"
        ></Image>
      </Grid>
    </Grid>
  );
}
