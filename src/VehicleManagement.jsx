import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrashAlt, FaQrcode, FaPrint, FaAngleLeft, FaAngleRight} from "react-icons/fa";
import '../src/style/table.css';
import '../src/style/ModalRegister.css';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import Swal from 'sweetalert2';
import jsPDF from "jspdf";
import "jspdf-autotable";

const VehicleManagement = () => {
  const [vehicles, setVehicles] = useState([]);
  const [showEditForm, setShowEditForm] = useState(false); // State for edit modal
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(8);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentVehicle, setCurrentVehicle] = useState(null); // State for the vehicle being edited

  // State for edit info
  const [editInfo, setEditInfo] = useState({
    vehicleType: "",
    plateNumber: ""
  });

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "user"));
        const vehicleData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: `${data.firstName} ${data.lastName}`,
            vehicleType: data.vehicle?.vehicleType || "N/A", // Accessing nested vehicle data
            plateNumber: data.vehicle?.plateNumber || "N/A" // Accessing nested vehicle data
          };
        });
        setVehicles(vehicleData);
      } catch (error) {
        console.error("Error fetching vehicles:", error);
      }
    };
    fetchVehicles();
  }, []);

  // Filter vehicles based on the search term
  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.vehicleType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate the total number of pages based on filtered vehicles
  const totalPages = Math.ceil(filteredVehicles.length / usersPerPage);

  // Get current vehicles based on the current page
  const indexOfLastVehicle = currentPage * usersPerPage;
  const indexOfFirstVehicle = indexOfLastVehicle - usersPerPage;
  const currentVehicles = filteredVehicles.slice(indexOfFirstVehicle, indexOfLastVehicle);

  // Handle next page
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Handle previous page
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleEditClick = (vehicle) => {
    setCurrentVehicle(vehicle); // Set the vehicle to be edited
    setEditInfo({
      vehicleType: vehicle.vehicleType,
      plateNumber: vehicle.plateNumber
    });
    setShowEditForm(true); // Show the edit modal
  };

  const handleCloseModal = () => {
    setShowEditForm(false); // Close the edit modal
    setCurrentVehicle(null); // Reset current vehicle
  };

  const handleSaveClick = async () => {
    if (currentVehicle) {
      const vehicleDocRef = doc(db, "user", currentVehicle.id);
      try {
        await updateDoc(vehicleDocRef, {
          vehicle: {
            vehicleType: editInfo.vehicleType,
            plateNumber: editInfo.plateNumber
          }
        });

        setVehicles((prevVehicles) =>
          prevVehicles.map((vehicle) =>
            vehicle.id === currentVehicle.id
              ? { ...vehicle, vehicleType: editInfo.vehicleType, plateNumber: editInfo.plateNumber }
              : vehicle
          )
        );

        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Vehicle information updated successfully!",
        });

        handleCloseModal();
      } catch (error) {
        console.error("Error updating vehicle:", error);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Error updating vehicle, try again!",
        });
      }
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to delete this vehicle? This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#66894c',
      cancelButtonColor: '#a9bc9a',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      try {
        // Delete the vehicle document from Firestore
        await deleteDoc(doc(db, "user", vehicleId));

        // Update the UI to reflect the deletion
        setVehicles((prevVehicles) => prevVehicles.filter((vehicle) => vehicle.id !== vehicleId));

        Swal.fire({
          icon: "success",
          title: "Deleted",
          text: "Vehicle has been successfully deleted.",
        });
      } catch (error) {
        console.error("Error deleting vehicle:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "An error occurred while deleting the vehicle. Please try again.",
        });
      }
    }
  };

  const handleInputChange = (e) => {       
    const { name, value } = e.target;
    setEditInfo((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

    // Function to export the table data to PDF
    const exportTableToPDF = () => {
      const doc = new jsPDF('p', 'mm', 'a4'); // Portrait mode, millimeters, A4 size
    
      // Summary Section
      const vehicleSummary = {
        total: vehicles.length,
        Ebike: vehicles.filter(v => v.vehicleType === 'Ebike').length,
        Car: vehicles.filter(v => v.vehicleType === 'Car').length,
        Motorcycle: vehicles.filter(v => v.vehicleType === 'Motorcycle').length,
        Tricycle: vehicles.filter(v => v.vehicleType === 'Tricycle').length,
      };
    
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      let currentY = 20; // Initial Y-coordinate for the summary
    
      doc.text(`Total Vehicles: ${vehicleSummary.total}`, 14, currentY);
      currentY += 8; // Add spacing after the total
    
      doc.text('Type of Vehicle:', 14, currentY);
      currentY += 8; // Add spacing after the label
    
      doc.text(`Ebike: ${vehicleSummary.Ebike}`, 20, currentY);
      currentY += 6; // Add spacing after each type
    
      doc.text(`Car: ${vehicleSummary.Car}`, 20, currentY);
      currentY += 6;
    
      doc.text(`Motorcycle: ${vehicleSummary.Motorcycle}`, 20, currentY);
      currentY += 6;
    
      doc.text(`Tricycle: ${vehicleSummary.Tricycle}`, 20, currentY);
      currentY += 5; // Extra spacing before the table
    
      // Sort vehicles by type
      const sortedVehicles = [
        ...vehicles.filter(v => v.vehicleType === 'Ebike'),
        ...vehicles.filter(v => v.vehicleType === 'Car'),
        ...vehicles.filter(v => v.vehicleType === 'Motorcycle'),
        ...vehicles.filter(v => v.vehicleType === 'Tricycle'),
      ];
    
      doc.autoTable({
        startY: currentY,
        head: [['Name', 'Plate Number', 'Vehicle Type']],
        body: sortedVehicles.map(vehicle => [
          vehicle.name || 'N/A',
          vehicle.plateNumber || 'N/A',
          vehicle.vehicleType || 'N/A',
        ]),
        styles: {
          fontSize: 10,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [244, 244, 244], // Light gray header background
          textColor: [0, 0, 0], // Black header text
          fontStyle: 'bold',
        },
        bodyStyles: {
          fillColor: [255, 255, 255], // White background for all body rows
          textColor: [0, 0, 0], // Black text for all body rows
        },
        alternateRowStyles: { fillColor: false }, // Disable alternate row styling
      });
    
      // Footer
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.text('Report for Vehicle Details', 15, pageHeight - 15);
    
      // Save PDF
      doc.save('vehicle-management-report.pdf');
    };
    
    

  return (
    <div className="Usermanage">
      <div className="Usermanage-con">
        <div className="UserTable">
          <div className="header-container">
            <div className="headerText">
              <h3>Vehicle Management</h3>
            </div>
            <div className="button-container">
              <input
                className="search-input-tbl"
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)} // Update searchTerm state
              />

              <button className='icon-search' onClick={exportTableToPDF}>
                <FaPrint className='icon-td' />
              </button>

            </div>
          </div>

          <table className="table">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Plate No.</th>
                <th scope="col">Vehicle Type</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentVehicles.length > 0 ? (
                currentVehicles.map((vehicle) => (
                  <tr key={vehicle.id}>
                    <td>{vehicle.name}</td>
                    <td>{vehicle.plateNumber}</td>
                    <td>{vehicle.vehicleType}</td>
                    <td>
                      <button className="btn btn-primary" onClick={() => handleEditClick(vehicle)}>
                        <FaEdit />
                      </button>
                      <button className="btn btn-danger" onClick={() => handleDeleteVehicle(vehicle.id)}>
                        <FaTrashAlt />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="no-data-row">
                  <td colSpan="4">No vehicles found</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination controls */}
          <div className="pagination">
            <button onClick={prevPage} disabled={currentPage === 1}> <FaAngleLeft /> </button>
            <div className='page-container'>
              <span>Page {currentPage} of {totalPages}</span>
            </div>
            <button onClick={nextPage} disabled={currentPage === totalPages}> <FaAngleRight /> </button>
          </div>
        </div>

        {showEditForm && currentVehicle && ( // Render edit modal if showEditForm is true
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="container">
                <h3>Edit Vehicle Information</h3>
                <div className="reg-con">
                  <div className="reg-input">
                    <input
                      type="text"
                      name="plateNumber"
                      value={editInfo.plateNumber}
                      onChange={handleInputChange}
                      placeholder="Plate No."
                    />
                  </div>
                  <div className="reg-input">
                    <input
                      type="text"
                      name="vehicleType"
                      value={editInfo.vehicleType}
                      onChange={handleInputChange}
                      placeholder="Vehicle Type"
                    />
                  </div>
                </div>
                <div className="reg-button">
                  <button className="btn-reg" onClick={handleCloseModal}>Cancel</button>
                  <button className="btn-reg" onClick={handleSaveClick}>Save</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleManagement;