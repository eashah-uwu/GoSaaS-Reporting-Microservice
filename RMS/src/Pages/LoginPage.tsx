import Navbar from "../Components/Navbar/Navbar";
import { useState,useEffect } from "react";
import { Formik, FormikHelpers } from "formik";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setToken, setUserId } from "../State/authSlice";
import axios from "axios";
import styles from "./pages.module.css";
import { toast } from "react-toastify";

import {
  Box,
  Button,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import React from "react";

const loginSchema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().required("Password is required"),
});

const initialValuesLogin = {
  email: "",
  password: "",
};

interface LoginValues {
  email: string;
  password: string;
}

function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [flag, setFlag] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isNonMobile = useMediaQuery("(min-width:600px)");
  const isMediumScreen = useMediaQuery("(min-width:960px)");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    console.log(window.location.search)
    const errorParam = urlParams.get("error");

    if (errorParam === "UnauthorizedDomain") {
      toast.error("Only Gosaas accounts are allowed to log in.");
      urlParams.delete("error");
      navigate({ search: urlParams.toString() }, { replace: true });
    }
  }, []);

  const login = async (
    values: LoginValues,
    onSubmitProps: FormikHelpers<LoginValues>
  ) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/login`,
        values
      );

      const { token, userId } = response.data; // Assuming the response contains userId
      dispatch(setToken(token));
      dispatch(setUserId(userId)); // Dispatch userId
      localStorage.setItem("token", token);
      localStorage.setItem("userId", userId); // Store userId in local storage
      navigate("/");
    } catch (error) {
      setError("Login failed");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/api/auth/google`;
  };

  const handleFormSubmit = async (
    values: LoginValues,
    onSubmitProps: FormikHelpers<LoginValues>
  ) => {
    await login(values, onSubmitProps);
  };

  return (
    <>
      <Navbar />
      <div className={styles.parentContainer}>
        <Box
          display="flex"
          sx={{
            marginTop: 8,
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "40vh",
            width: isNonMobile ? "40%" : "90%",
            margin: "auto",
            borderRadius: "1rem",
            boxShadow: "0 0 10px 0 rgba(0,0,0,0.1)",
            borderBottom: "0.25rem solid #8B0000",
            borderColor: "#8B0000",
          }}
        >
          <img
            className="logo"
            src="logo.png"
            alt="logo"
            style={{
              width: isMediumScreen ? "40%" : "60%",
              height: "auto",
              marginTop: "3rem",
            }}
          />
          <Button
            fullWidth
            type="button"
            onClick={handleGoogleLogin}
            sx={{
              m: "1rem 0",
              mt: "3rem",
              p: "1rem",
              maxWidth: "80%",
              backgroundColor: "#8B0000",
              color: "#FFFFFF",
              borderRadius: "0.5rem",
              whiteSpace: "nowrap",
              "&:hover": {
                backgroundColor: "#C70039",
              },
            }}
          >
            Sign in with Google
          </Button>

          <Typography variant="body1" color="textSecondary" sx={{ mx: 2 }}>
            or
          </Typography>

          {!flag && (
            <Typography
              variant="body1"
              color="primary"
              sx={{
                mt: "1rem",
                mb: "3rem",
                "&:hover": {
                  color: "#8B0000",
                  cursor: "pointer",
                },
              }}
              onClick={() => setFlag(!flag)}
            >
              Log in with Credentials
            </Typography>
          )}

          {flag && (
            <Formik
              onSubmit={handleFormSubmit}
              initialValues={initialValuesLogin}
              validationSchema={loginSchema}
            >
              {({
                values,
                errors,
                touched,
                handleBlur,
                handleChange,
                handleSubmit,
              }) => (
                <form className="loginForm" onSubmit={handleSubmit}>
                  <Box
                    component="div"
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    sx={{
                      height: flag ? "auto" : 0,
                      opacity: flag ? 1 : 0,
                      overflow: "hidden",
                      transition: "all 0.5s ease-in-out",
                      marginTop: "1em",
                    }}
                  >
                    <Box
                      display="grid"
                      gap="30px"
                      gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                      sx={{
                        "& > div": {
                          gridColumn: isNonMobile ? undefined : "span 4",
                        },
                      }}
                      style={{ marginTop: "2%" }}
                    >
                      <TextField
                        label="Email"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        value={values.email}
                        name="email"
                        error={Boolean(touched.email) && Boolean(errors.email)}
                        helperText={touched.email && errors.email}
                        fullWidth
                        sx={{
                          gridColumn: "span 4",
                          width: "100%",
                          pt: "0.5rem",
                          maxWidth: "80%",
                        }}
                        style={{
                          marginLeft: "10%",
                          width: "600px",
                        }}
                      />
                      <TextField
                        label="Password"
                        type="password"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        value={values.password}
                        name="password"
                        error={
                          Boolean(touched.password) && Boolean(errors.password)
                        }
                        helperText={touched.password && errors.password}
                        fullWidth
                        sx={{
                          gridColumn: "span 4",
                          width: "100%",
                          pt: "0.5rem",
                          maxWidth: "80%",
                        }}
                        style={{
                          marginLeft: "10%",
                          width: "600px",
                        }}
                      />
                    </Box>

                    {error && (
                      <Box mt="0.5rem">
                        <Typography variant="body2" color="error">
                          {error}
                        </Typography>
                      </Box>
                    )}

                    <Box mt="1.5rem">
                      <Button
                        fullWidth
                        type="submit"
                        sx={{
                          m: "1rem ",
                          mb: "5rem",
                          p: "1rem",
                          maxWidth: "80%",
                          backgroundColor: "#8B0000",
                          color: "#FFFFFF",
                          borderRadius: "0.5rem",
                          whiteSpace: "nowrap",
                          "&:hover": {
                            backgroundColor: "#C70039",
                          },
                        }}
                      >
                        LOGIN
                      </Button>
                    </Box>
                  </Box>
                </form>
              )}
            </Formik>
          )}
        </Box>
      </div>
    </>
  );
}

export default LoginPage;
