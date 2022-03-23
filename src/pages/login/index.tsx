import React, { useEffect, useRef } from "react";
import { FC, ReactElement } from "react";
import "./index.css";
import Login from "./login";
import Register from "./register";
const { ipcRenderer } = window.require("electron");

const LoginAndRegister: FC = (): ReactElement => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        ipcRenderer.send("goto login page");
    }, [])

    return (
        <div className="login-wrapper">
            <div className="login-container" ref={containerRef}>
                <div className="login">
                    <Login containerRef={containerRef} />
                </div>
                <div className="register">
                    <Register containerRef={containerRef} />
                </div>
            </div>
        </div>
    )
}

export default LoginAndRegister;