import Navbar from "../Components/Navbar/Navbar";
import { useState } from "react";
import { Formik } from "formik";
import * as yup from "yup";
import { useNavigate, Link } from "react-router-dom";
// import { useDispatch } from "react-redux";
// import { setLogin } from "../state";
import {
  Box,
  Button,
  Divider,
  TextField,
  Typography,
  useTheme,
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

function LoginPage() {
  const [error, setError] = useState(null);
  const [flag, setFlag] = useState(false);
  // const dispatch = useDispatch();
  // const navigate = useNavigate();
  const isNonMobile = useMediaQuery("(min-width:600px)");
  // const login = async (values, onSubmitProps) => {
  //     try {
  //         const loggedInResponse = await fetch(
  //             "http://localhost:3001/auth/login",
  //             {
  //                 method: "POST",
  //                 headers: { "Content-Type": "application/json" },
  //                 body: JSON.stringify(values),
  //             }
  //         );

  //         if (!loggedInResponse.ok) {
  //             throw new Error("Login failed. Please check your credentials.");
  //         }

  //         const loggedIn = await loggedInResponse.json();

  //         onSubmitProps.resetForm();

  //         dispatch(
  //             setLogin({
  //                 user: loggedIn.user,
  //                 token: loggedIn.token,
  //             })
  //         );
  //         navigate("/community");
  //     } catch (error) {
  //         console.error("Login error:", error.message);

  //         setError(error.message);
  //     }
  // };

  const handleFormSubmit = async () => {
    // await login(values, onSubmitProps);
  };

  return (
    <>
      <Navbar />
      <Box
        display="flex"
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "40vh",
          width: "40%",
          margin: "auto",
          borderRadius: "1rem",
          boxShadow: "0 0 10px 0 rgba(0,0,0,0.1)",
          // border: '0.25rem solid #8B0000',
          borderBottom: "0.25rem solid #8B0000",
          borderColor: "#8B0000",
        }}
      >
        <img
          className="logo"
          src="logo.png"
          alt="logo"
          style={{ width: "40%", height: "auto", marginTop: "3rem" }}
        />
        <Button
          fullWidth
          type="submit"
          sx={{
            m: "1rem 0",
            mt: "3rem",
            p: "1rem",
            width: "400px",
            backgroundColor: "#8B0000",
            color: "#FFFFFF",
            borderRadius: "0.5rem",
            "&:hover": {
              backgroundColor: "#C70039",
            },
          }}
        >
          Sign in with Google
        </Button>

        <Typography variant="body1" color="error" sx={{ mx: 2 }}>
          or
        </Typography>

        {!flag && (
          <Typography
            variant="body1"
            color="error"
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
              setFieldValue,
              resetForm,
            }) => (
              <form className="loginForm" onSubmit={handleSubmit}>
                <Box
                  component="div"
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  height="90vh"
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
                  >
                    <TextField
                      label="Email"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values.email}
                      name="email"
                      error={Boolean(touched.email) && Boolean(errors.email)}
                      helperText={touched.email && errors.email}
                      sx={{
                        gridColumn: "span 4",
                        width: "400px",
                        pt: "0.5rem",
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
                      sx={{
                        gridColumn: "span 4",
                        width: "400px",
                        pt: "0.5rem",
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
                        width: "400px",
                        backgroundColor: "#8B0000",
                        color: "#FFFFFF",
                        borderRadius: "0.5rem",
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
    </>
  );
}

export default LoginPage;
