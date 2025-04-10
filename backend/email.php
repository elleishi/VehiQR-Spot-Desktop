<?php
header("Access-Control-Allow-Origin: *"); // Allow from any origin
header("Access-Control-Allow-Headers: Content-Type"); // Allow specific headers

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require '../vendor/phpmailer/src/Exception.php';
require '../vendor/phpmailer/src/PHPMailer.php';
require '../vendor/phpmailer/src/SMTP.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $data = json_decode(file_get_contents('php://input'), true);
    $email = $data['email'] ?? '';
    $first_name = $data['First_Name'] ?? '';
    $last_name = $data['Last_Name'] ?? '';
    $password = $data['Password'] ?? '';
    $name = $first_name . ' ' . $last_name;

    $mail = new PHPMailer(true);

    try {

        $mail->isSMTP();                              
        $mail->Host       = 'smtp.gmail.com';       
        $mail->SMTPAuth   = true;                    
        $mail->Username   = 'actech.atservice@gmail.com'; // Your email address (sender)
        $mail->Password   = 'oigyneehnkpbrqao';      // Your email password (or app password if using Gmail)
        $mail->SMTPSecure = 'ssl';                   
        $mail->Port       = 465;                     

        // Sender's info (You, the sender)
        $mail->setFrom('VehiQR-Spot@gmail.com', 'A.C Tech Service'); 

        // Recipient's email (The user)
        $mail->addAddress($email, $first_name . ' ' . $last_name);

        $mail->Subject = 'VehiQR-Spot';

        $mail->isHTML(true); 

        // Email body content
        $mail->Body = '
<html>
    <head>
        <style>
            .container{
                font-family: Arial, Helvetica, sans-serif, sans-serif;
                width: 100%;
                height: 100%;
                margin: 0 auto;
            }
            .header, h3{
                font-size: 13px;
                font-weight: bold;
                color: #333;
                padding-bottom: 1px;
            }
            .greetings{
                font-size: 9px;
                margin: 0px 0;
            }
            .message{
                font-size: 9px;
                color: #333;
                font-weight: 500;
            }
            .info-con{
                margin-top: 10px;
            }
            .info{
                font-size: 9px;
                font-weight: 600;
                color: #333;
            }
            .info2{
                font-size: 9px;
                font-weight: 600;
                color: #333;
                margin-top: -18px;
            }
            .message-footer{
                font-size: 9px;
                font-weight: 300;   
            }
            .message-footer2{
                margin-top: -7px;
                font-size: 9px;
                font-weight: 600;
            }

        </style>


        <div class="container">
            <h3 class="header">VehiQR-Spot</h3>
            <h6 class ="greetings">Good Day, ' . $first_name . ' ' . $last_name . ' !</h6>
            <h2 class = "message"> We are pleased to inform you that your registration with VehiQR-Spot has been 
                successfully completed! Use this email and password to log in. 
                We are excited to have you onboard and look forward to making
                 your parking experience smoother. </h2>

            <div class = "info-con">
            <h6 class = "info"> Email: </h6>
            <h6 class = "info2"> Password: </h6>     
            </div>

            <h2 class = "message"> Please keep this information secure and contact us if you need any assistance. </h2>
            <h2 class="message-footer">Best wishes,</h2>    
            <h2 class="message-footer2">VehiQR-Spot Team</h2>
         </div>

    </body>
    </html>
        ';

        $mail->send();
        echo json_encode(['message' => 'Notification sent successfully to the user']);
    } catch (Exception $e) {
        echo json_encode(['message' => "Email could not be sent. Mailer Error: {$mail->ErrorInfo}"]);
    }
}

?>
