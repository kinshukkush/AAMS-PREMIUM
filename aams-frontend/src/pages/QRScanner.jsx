import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Camera, CheckCircle, AlertCircle, X } from 'lucide-react';
import {
  Card, CardBody, CardHeader,
  Button,
  Badge,
  Alert,
  Spinner
} from '../../components';

export default function QRScanner() {
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [scanData, setScanData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Mock scan result
  const mockScanResult = {
    id: 'QR-20260408-001',
    course: 'Data Structures',
    sessionTime: '10:00 AM - 11:30 AM',
    validUntil: new Date(Date.now() + 60000), // 1 minute from now
    classroom: 'Lab-101',
    instructor: 'Dr. Rajesh Kumar',
    status: 'active'
  };

  const handleStartScan = () => {
    setScanning(true);
    // Simulate camera activation
    setTimeout(() => {
      // Simulate successful scan after 2 seconds
      setLoading(true);
      setTimeout(() => {
        setScanData(mockScanResult);
        setScanned(true);
        setLoading(false);
      }, 1500);
    }, 1000);
  };

  const handleConfirmAttendance = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setScanData({ ...scanData, submitted: true });
      setLoading(false);
    }, 1500);
  };

  const handleScanAgain = () => {
    setScanned(false);
    setScanData(null);
    setScanning(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-50">
          QR Attendance
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Scan the QR code displayed in your classroom to mark attendance
        </p>
      </motion.div>

      {/* Info Alert */}
      <Alert
        variant="info"
        title="How it works"
        message="Your instructor will display a QR code for each session. Scan it using your camera to automatically mark your attendance."
      />

      {/* Main Scanner Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scanner */}
        <div className="lg:col-span-2">
          <Card>
            <CardBody className="space-y-6">
              {!scanned ? (
                <>
                  {/* Camera Feed Area */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="relative w-full aspect-square bg-gradient-to-br from-dark-700 to-dark-900 rounded-xl overflow-hidden border-2 border-primary-500/30"
                  >
                    {scanning && !loading && (
                      <>
                        {/* Camera placeholder */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="relative w-full h-full">
                            {/* QR scan frame */}
                            <div className="absolute inset-8 border-2 border-primary-500" />
                            
                            {/* Corner markers */}
                            {[
                              'top-0 left-0',
                              'top-0 right-0',
                              'bottom-0 left-0',
                              'bottom-0 right-0'
                            ].map((pos) => (
                              <div
                                key={pos}
                                className={`absolute w-6 h-6 border-2 border-primary-500 ${pos}`}
                              />
                            ))}

                            {/* Scanning animation */}
                            <motion.div
                              animate={{ y: ['-100%', '100%'] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="absolute inset-x-8 h-1 bg-gradient-to-b from-primary-500 to-transparent"
                            />

                            {/* Center icon */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                              >
                                <Camera size={64} className="text-primary-500" />
                              </motion.div>
                            </div>
                          </div>
                        </div>

                        {/* Status text */}
                        <div className="absolute bottom-4 left-0 right-0 text-center">
                          <p className="text-primary-400 font-medium">Position QR code in frame</p>
                        </div>
                      </>
                    )}

                    {!scanning && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <QrCode size={80} className="text-neutral-400 mx-auto mb-4" />
                          <p className="text-neutral-400">Ready to scan</p>
                        </div>
                      </div>
                    )}

                    {loading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur">
                        <div className="text-center">
                          <Spinner size="lg" className="mx-auto mb-4" />
                          <p className="text-white">Processing scan...</p>
                        </div>
                      </div>
                    )}
                  </motion.div>

                  {/* Controls */}
                  <div className="space-y-3">
                    <Button
                      variant={scanning ? 'danger' : 'primary'}
                      fullWidth
                      onClick={() => setScanning(!scanning)}
                      disabled={loading}
                    >
                      {scanning ? 'Stop Scanning' : 'Start Camera'}
                    </Button>
                    <p className="text-sm text-center text-neutral-600 dark:text-neutral-400">
                      Enable camera permissions to scan QR codes
                    </p>
                  </div>
                </>
              ) : (
                <>
                  {/* Success State */}
                  {scanData?.submitted ? (
                    <div className="space-y-6 py-8 text-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                      >
                        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                          <CheckCircle size={40} className="text-white" />
                        </div>
                      </motion.div>

                      <div>
                        <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                          Attendance Marked!
                        </p>
                        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
                          Your attendance has been recorded successfully
                        </p>
                      </div>

                      <Button
                        variant="primary"
                        fullWidth
                        onClick={handleScanAgain}
                      >
                        Scan Another QR Code
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="p-6 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-950 dark:to-primary-900 rounded-xl">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-primary-500 rounded-lg">
                            <QrCode size={24} className="text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-primary-700 dark:text-primary-300">
                              QR Code Detected
                            </p>
                            <p className="text-sm text-primary-600 dark:text-primary-400 mt-1">
                              Verifying session details...
                            </p>
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        fullWidth
                        onClick={() => setScanned(false)}
                      >
                        Try Another QR Code
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Session Details Sidebar */}
        <div className="space-y-4">
          {scanned && scanData && (
            <>
              <Card>
                <CardHeader title="Session Details" />
                <CardBody className="space-y-4">
                  <div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Course</p>
                    <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                      {scanData.course}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Classroom</p>
                    <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                      {scanData.classroom}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Time</p>
                    <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                      {scanData.sessionTime}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Instructor</p>
                    <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                      {scanData.instructor}
                    </p>
                  </div>

                  <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      QR expires in <strong>59 seconds</strong>
                    </p>
                  </div>

                  <Badge variant="success" fullWidth>
                    Valid QR Code
                  </Badge>
                </CardBody>
              </Card>

              {!scanData.submitted && (
                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleConfirmAttendance}
                  loading={loading}
                >
                  Confirm Attendance
                </Button>
              )}
            </>
          )}

          {!scanned && (
            <Card>
              <CardBody className="space-y-4 text-center">
                <Camera size={40} className="text-neutral-400 mx-auto" />
                <div>
                  <p className="font-semibold text-neutral-900 dark:text-neutral-50">
                    Ready to Scan
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
                    Click "Start Camera" to begin scanning QR codes
                  </p>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>

      {/* Tips */}
      <Card>
        <CardHeader title="Tips for Better Scanning" />
        <CardBody>
          <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
            <li>✓ Ensure good lighting conditions</li>
            <li>✓ Hold your device steady</li>
            <li>✓ Position the QR code within the frame</li>
            <li>✓ QR codes expire after 1-2 minutes</li>
            <li>✓ You can only mark attendance once per session</li>
          </ul>
        </CardBody>
      </Card>
    </div>
  );
}
