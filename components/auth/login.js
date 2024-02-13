"use client"
import styles from "@/app/page.module.css";
import { useState } from "react";

export default function LoginPage(){
  
  const letterNumberOnlyRegex = /^[a-zA-Z0-9_]+$/;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showHidePass, setShowHidePass] = useState(false);
  // Form
  const [errMessage, setErrMessage] = useState("");
  const [errUser, setErrUser] = useState("");
  const [errPass, setErrPass] = useState("");

  async function onSubmit(event){
    event.preventDefault();
    if(username && password){
      // procceed submit to server

      setErrMessage("");
      setErrUser("");
      setErrPass("");
      return;
    }

    setErrMessage("Error: Invalid Form.");
  }

  function handleInputChange(event){
    const value = event.target.value;
    switch (event.target.id) {
      case "username":
        setUsername(value);
        if(!letterNumberOnlyRegex.test(value)){
          setErrUser("Letter, numbers, or underscore only!");
          return;
        }

        if(value.length<8){
          setErrUser("Minimum of 8 characters.");
          return;
        }
        
        setErrUser("");
      break;
    
      default:
        setPassword(value);

        if(value.length<8){
          setErrPass("Minimum of 8 characters.");
          return;
        }

        setErrPass("");
      break;
    }
  }

  function handleShowHidePass(){
    setShowHidePass(!showHidePass)
  }

  return(
    <>
      <div className={`container ${styles.c_login}`}>
        <div className="row d-flex justify-content-center align-items-center">
          <div className="col-lg-4 col-md-6 col-sm-10 col-10 mb-3 mb-sm-0">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Admin Dashboard Login</h5>
                {errMessage ? <p className="text-danger">{errMessage}</p>: ""}
                <form className="row g-3 needs-validation" novalidate onSubmit={onSubmit}>
                  <div className="col-12">
                    <input 
                      type="text" 
                      className={`form-control ${errUser && "is-invalid"}`} 
                      id="username" 
                      placeholder="username"
                      value={username}
                      onChange={handleInputChange}
                      required
                    />
                    <div className={`${errUser ? "in" : ""}valid-feedback`}>{errUser}</div>
                  </div>
                  <div className="col-12">
                    <div class="input-group mb-3">
                      <input
                        type={showHidePass?"text":"password"} 
                        className={`form-control ${errPass && "is-invalid"}`} 
                        id="password" 
                        placeholder="password" 
                        value={password}
                        onChange={handleInputChange}
                        required
                      />
                      <button 
                        class={`btn btn-outline-${errPass?"danger":"secondary"}`} 
                        type="button" 
                        onClick={handleShowHidePass}
                      >
                        {showHidePass ?
                        <i class="bi bi-eye-slash"></i>:
                        <i class="bi bi-eye"></i>
                        }
                      </button>
                    </div>
                    <div className={`${errPass ? "in" : ""}valid-feedback`}>{errPass}</div>
                  </div>
                  <div className="col-12">
                    <button className="btn btn-primary" type="submit">Login</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}