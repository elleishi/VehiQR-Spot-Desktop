
import React, { useState, useEffect, useRef } from "react";
// api
import emailjs from '@emailjs/browser';
import { QRCodeCanvas } from 'qrcode.react';
// firebase
import { db, storage } from '../firebaseConfig';
import { doc, setDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
// styles
import logo from '../src/Image/boxVehiqr.png';
import '../src/style/ModalRegister.css'
import Swal from 'sweetalert2';

const RegisterWithQR = ({ onClose }) => { 
  const [formData, setFormData] = useState({
    First_Name: "",
    Last_Name: "",
    Email: "",
    Phone_Number: "",
    Address: "",
    Password: "",
    Role: "",
    Plate_Number: "",
    Vehicle_Type: ""
  });

  const [qrValue, setQRValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const qrRef = useRef(null);
  const auth = getAuth();

  const [year, setYear] = useState(""); // New state for year
  const [department, setDepartment] = useState(""); // New state for department
  const [course, setCourse] = useState(""); // New state for course


  {/**********************************************************************************************
  // dont change anything here
  **********************************************************************************************/}

  useEffect(() => {
    if (qrValue && formData.uid) {
      const timer = setTimeout(() => {
        const canvas = qrRef.current.querySelector('canvas');
        if (canvas) {
          canvas.toBlob(async (blob) => {
            if (blob) {
              const currentMonth = new Date().toISOString().split('T')[0].slice(0, 7);
              const userRef = doc(db, "qrCode", formData.uid);
              const storageRef = ref(storage, `qrCodes/${currentMonth}/${formData.uid}.png`);
              await uploadBytes(storageRef, blob);

              const downloadURL = await getDownloadURL(storageRef);
              
              await setDoc(userRef, {
                uid: formData.uid,
                qrData: qrValue,
                qrImageURL: downloadURL,
                createdAt: new Date().toISOString(),
                date: currentDate,
              });

              const userDocRef = doc(db, "user", formData.uid);
              console.log("Updating user document with UID:", formData.uid);
              await updateDoc(userDocRef, {
                qrImageURL: downloadURL, 
              });

              setIsSubmitting(false);
            } else {
              console.error("Failed to create QR code blob!");
            }
          }, "image/png"); 
        } else {
          console.error("QR code canvas not found!");
        }
      }, 500);
      return () => clearTimeout(timer); 
    }
  }, [qrValue, formData.uid]); 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    if (e.target.name === "Role") {
      setYear("");
      setDepartment("");
      setCourse("");
    }
  };

  const generatePassword = () => {
    const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const passwordLength = 6;
    let Password = "";
    for (let i = 0; i < passwordLength; i++) { 
      const randomNumber = Math.floor(Math.random() * chars.length);
      Password += chars.substring(randomNumber, randomNumber + 1);
    }
    setFormData({ ...formData, Password });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { Email, Password, First_Name, Last_Name, Phone_Number, Address, Role, Plate_Number } = formData;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, Email, Password);
      const user = userCredential.user;

      setFormData((prevData) => ({ ...prevData, uid: user.uid }));

      const qrData = JSON.stringify({
        Name: `${First_Name} ${Last_Name}`,
        Email,
        PhoneNumber: Phone_Number,
        Address,
        Role,
        PlateNumber: Plate_Number, // added ************************************************************
        uid: user.uid,
      });
      console.log("QR Data:", qrData); 
      setQRValue(qrData);

      const userData = {
        uid: user.uid,
        firstName: formData.First_Name,
        lastName: formData.Last_Name,
        email: formData.Email,
        phoneNumber: formData.Phone_Number,
        address: formData.Address,
        password: formData.Password, 
        role: formData.Role,
        createdAt: new Date().toISOString(),
        vehicle: {
          plateNumber: formData.Plate_Number,
          vehicleType: formData.Vehicle_Type,
          timestamp: serverTimestamp(),
        },
        violation: [] // added  ************************************************************
      };

      if (Role === "Student") {
        userData.year = year;
        userData.course = course;
    } else if (Role === "Faculty") {
        userData.department = department; 
      }

    await setDoc(doc(db, "user", user.uid), userData);

 
    {/* dont forget to uncomment this code to enable emailJS *************************************
      // emailJS
      const templateParameters = {
        name: `${formData.First_Name} ${formData.Last_Name}`,
        email: formData.Email,
        password: formData.Password,
      };
      emailjs.send("service_vehiqrspot", "template_7xlyj7q", templateParameters, "A8NERt2gnSsktFLQq")
      .then((result) => {
        console.log('Email sent successfully:', result.text);
      }, (error) => {
        console.error('Email sending failed:', error.text);
      });
    */}

  {/**********************************************************************************************
  // dont change anything here - end
  **********************************************************************************************/}

    Swal.fire({
      icon: "success",
      title: "Success",
      text: "Account successfully created!",
      customClass: {
        confirmButton: 'my-confirm-button'
            }
    });

    onClose();
    } catch (e) {
      console.error("Error adding document: ", e);
   
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Error creating account, try again!",
      customClass: {
        confirmButton: 'my-confirm-button'
      }
    });

    } finally {
      setIsSubmitting(false);
    }};

 
 
  return (
    <div className="container">
      <h3>Register Account</h3>
      <h4>Personal Information</h4>

      <form onSubmit={handleSubmit}>
        <div className="reg-con">
          <div className="reg-input">
            <input
              type="text"
              name="First_Name"
              value={formData.First_Name}
              onChange={handleChange}
              required
              placeholder="First Name"
            />
          </div>
          <div className="reg-input">
            <input
              type="text"
              name="Last_Name"
              value={formData.Last_Name}
              onChange={handleChange}
              required
              placeholder="Last Name"
            />
          </div>
        </div>
        <div className="reg-con">
          <div className="reg-input">
            <input
              type="email"
              name="Email"
              value={formData.Email}
              onChange={handleChange}
              required
              placeholder="Email"
            />
          </div>
          <div className="reg-input">
            <input
              type="text"
              name="Phone_Number"
              value={formData.Phone_Number}
              onChange={handleChange}
              required
              placeholder="Phone No."
            />
          </div>
        </div>

        <input
          type="address"
          name="Address"
          value={formData.Address}
          onChange={handleChange}
          required
          placeholder="Address"
        />

        <div className="pass-role">
        <div className="pass">
          <div className="reg-input-role">
            <input
              type="password"
              name="Password"
              value={formData.Password}
              onChange={handleChange}
              placeholder="Password"
            />
            <button type="button" onClick={generatePassword} className="generatePass-btn">Generate</button>
          </div>
        </div>
        <div className="role-style">
        <select
          name="Role"
          value={formData.Role}
          onChange={handleChange}
          required
        >
      
          <option value="" disabled selected>Role</option>
          <option value="Student">Student</option>
          <option value="Faculty">Faculty</option>
          <option value="Staff">Staff</option>
          <option value="Admin">Admin</option>
      </select>
      </div>
    </div>

    {formData.Role === "Student" && (
        <div className="reg-con-role">
        <div className="reg-input-role">
        <select
            name="Course"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            required
          >
            <option value="" disabled selected>Course</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Computer Science">Computer Science</option>
          </select>
          <select
            name="Year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            required
          >
            <option value="" disabled selected>Year</option>
            <option value="1st">1st</option>
            <option value="2nd">2nd</option>
            <option value="3rd">3rd</option>
            <option value="4th">4th</option>
          </select>

          </div>
        </div>
      )}

      {formData.Role === "Faculty" && (
        <div className="reg-con-role">
        <div className="reg-input-role">
          <select
            name="Department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            required
          >
            <option value="" disabled selected>Department</option>
            <option value="DCS">DCS</option>
            <option value="DIT">DIT</option>
          </select>

        </div>
        </div>
      )}

        <hr/>

        <h4>Vehicle Information</h4>
        <div className="pass-role">
        <div className="pass">
          <div className="reg-input-role">
            <input
              type="plate"
              name="Plate_Number"
              value={formData.Plate_Number}
              onChange={handleChange}
              required
              placeholder="Plate No."
            />
            </div>
          </div>

          <div className="role-style">
          <select
            
            name="Vehicle_Type"
            value={formData.Vehicle_Type}
            onChange={handleChange}
            required
          >
            <option value="" disabled selected>Vehicle Type</option>
            <option value="Car">Car</option>
            <option value="Motorcycle">Motorcycle</option>
            <option value="Ebike">E-Bike</option>
            <option value="Tricycle">Tricycle</option> 
          </select>
        </div></div>

        <div className="reg-button">
          <button className="btn-reg" type="button" onClick={() => onClose()}>Back</button>
          <button className="btn-reg" type="submit" disabled={isSubmitting}>Create</button>
        </div>
      </form>

      <div style={{ display: "none", margin: "3px" }} ref={qrRef}>
        <QRCodeCanvas
          value={qrValue}
          size={300}
          bgColor={"#fff"}
          fgColor={"#4F653E"}
          level="L"
          imageSettings={{
            src: logo,
            height: 60,
            width: 60,
            excavate: true,

          }}
        />
      </div>
    </div>
  );
};



export default RegisterWithQR;
