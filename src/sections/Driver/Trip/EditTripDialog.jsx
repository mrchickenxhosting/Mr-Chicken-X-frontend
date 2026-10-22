import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { Marker, GoogleMap, useJsApiLoader } from '@react-google-maps/api';

import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { Grid, Typography } from '@mui/material';
import DialogTitle from '@mui/material/DialogTitle';
import Autocomplete from '@mui/material/Autocomplete';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import {

  getallDriver,

  getallFarmer,

  getallLifter,

  getallBrokers,

} from 'src/services/Trader.service';



// ----------------------------------------------------------------------



export default function EditTripDialog({ open, onClose, trip, onSave }) {

  const isEditMode = Boolean(trip);

  const [farmName, setFarmName] = useState('');

  const [farmers, setFarmers] = useState([]);

  const [drivers, setDrivers] = useState([]);

  const [lifters, setLifters] = useState([]);

  const [brokers, setBrokers] = useState([]);



  const [sourceDriver, setSourceDriver] = useState(null);

  const [farmer, setFarmer] = useState(null);

  const [farm, setFarm] = useState(null);

  const [driver, setDriver] = useState(null);

  const [lifter, setLifter] = useState(null);

  const [broker, setBroker] = useState(null);



  // Separate driver and lifter selections for broker trips.

  const [brokerDriver, setBrokerDriver] = useState(null);

  const [brokerLifter, setBrokerLifter] = useState(null);



  // Broker-specific fields.

  const [minimumWeight, setMinimumWeight] = useState('');

  const [supervisorNumber, setSupervisorNumber] = useState('');

  const [onFillingNumber, setOnFillingNumber] = useState('');

  const [farmLocation, setFarmLocation] = useState('');

  const [farmNumber, setFarmNumber] = useState('');



  const [date, setDate] = useState(null);

  const [approxRate, setApproxRate] = useState('');

  const [birds, setBirds] = useState('');

  const [time, setTime] = useState('');



  const [contactName, setContactName] = useState('');

  const [contactPhone, setContactPhone] = useState('');

  const [sourceType, setSourceType] = useState('farmer');



  const [submitted, setSubmitted] = useState(false);



  // ----------------------------------------------------------------------

  // Fetch dropdown data



  useEffect(() => {

    if (!open) return undefined;



    let cancelled = false;



    const fetchData = async () => {

      try {

        const [farmersRes, driversRes, liftersRes, brokersRes] =

          await Promise.all([

            getallFarmer(),

            getallDriver(),

            getallLifter(),

            getallBrokers(),

          ]);



        if (cancelled) return;



        const toArray = (response, key) => {

          if (Array.isArray(response)) return response;

          if (Array.isArray(response?.data)) return response.data;

          if (Array.isArray(response?.[key])) return response[key];



          if (Array.isArray(response?.data?.[key])) {

            return response.data[key];

          }



          return [];

        };



        setFarmers(toArray(farmersRes, 'farmers'));

        setDrivers(toArray(driversRes, 'drivers'));

        setLifters(toArray(liftersRes, 'lifters'));

        setBrokers(toArray(brokersRes, 'brokers'));

      } catch (error) {

        console.error('Failed to load trip dropdown data:', error);

      }

    };



    fetchData();



    return () => {

      cancelled = true;

    };

  }, [open]);



  // ----------------------------------------------------------------------

  // Prefill trip details when creating or editing



  useEffect(() => {

    if (!open) return;



    // Reset all fields when creating a new trip.

    if (!trip) {

      setSubmitted(false);

      setSourceType('farmer');



      setSourceDriver(null);

      setFarmer(null);

      setFarm(null);

      setDriver(null);

      setLifter(null);

      setBroker(null);

      setBrokerDriver(null);

      setBrokerLifter(null);



      setMinimumWeight('');

      setSupervisorNumber('');

      setOnFillingNumber('');

      setFarmLocation('');

      setFarmNumber('');



      setDate(null);

      setApproxRate('');

      setBirds('');

      setTime('');

      setContactName('');

      setContactPhone('');



      return;

    }



    // Fill existing values when editing a trip.

    setSubmitted(false);

    setSourceType(trip.source_type || 'farmer');

    setApproxRate(trip.approx_rate ?? '');

    setBirds(String(trip.total_birds ?? ''));

    setTime(trip.trip_time?.slice(0, 5) || '');

    setDate(trip.trip_date ? dayjs(trip.trip_date) : null);



    setMinimumWeight(String(trip.minimum_weight ?? ''));

    setSupervisorNumber(trip.supervisor_number || '');

    setFarmName(trip.farm_name || '');

    setFarmLocation(trip.farm_location || '');

    setFarmNumber(trip.farm_number || '');



    setContactName(trip.contact_name || '');

    setContactPhone(

      String(trip.contact_phone || '').replace(/\D/g, '').slice(0, 10)

    );

  }, [open, trip]);



  // ----------------------------------------------------------------------

  // Prefill dropdown values after options load



  useEffect(() => {

    if (!trip) return;



    if (farmers.length) {

      const selectedFarmer = farmers.find(

        (item) => Number(item.id) === Number(trip.farmer_id)

      );



      setFarmer(selectedFarmer || null);



      const selectedFarm = selectedFarmer?.farms?.find(

        (item) => Number(item.id) === Number(trip.farm_id)

      );



      setFarm(selectedFarm || null);

    } else {

      setFarmer(null);

      setFarm(null);

    }



    if (drivers.length) {

      setDriver(

        drivers.find(

          (item) => Number(item.id) === Number(trip.driver_id)

        ) || null

      );



      setSourceDriver(

        drivers.find(

          (item) => Number(item.id) === Number(trip.source_driver_id)

        ) || null

      );



      setBrokerDriver(

        drivers.find(

          (item) => Number(item.id) === Number(trip.driver_id)

        ) || null

      );

    }



    if (lifters.length) {

      const selectedLifter =

        lifters.find(

          (item) => Number(item.id) === Number(trip.lifter_id)

        ) || null;



      setLifter(selectedLifter);

      setBrokerLifter(selectedLifter);

    }



    if (brokers.length) {

      setBroker(

        brokers.find(

          (item) => Number(item.id) === Number(trip.broker_id)

        ) || null

      );

    }

  }, [trip, farmers, drivers, lifters, brokers]);



  // ----------------------------------------------------------------------

  // Reset form



  const resetForm = () => {

    setSubmitted(false);

    setSourceType('farmer');



    setSourceDriver(null);

    setFarmer(null);

    setFarm(null);

    setDriver(null);

    setLifter(null);

    setBroker(null);



    setBrokerDriver(null);

    setBrokerLifter(null);



    setMinimumWeight('');

    setSupervisorNumber('');

    setOnFillingNumber('');

    setFarmLocation('');

    setFarmNumber('');



    setDate(null);

    setBirds('');

    setTime('');

    setContactName('');

    setContactPhone('');

    setApproxRate('');

  };



  const handleClose = () => {

    resetForm();

    onClose();

  };



  // ----------------------------------------------------------------------

  // Validation



  const phoneIsValid =

    contactPhone === '' || /^[6-9]\d{9}$/.test(contactPhone);



  const birdsValue = Number(birds);



  const birdsAreValid =

    String(birds).trim() !== '' &&

    Number.isInteger(birdsValue) &&

    birdsValue > 0;



  const rateIsValid =
    String(approxRate).trim() !== '' &&
    Number.isFinite(Number(approxRate)) &&
    Number(approxRate) >= 0;



  const dateIsValid = Boolean(date && dayjs(date).isValid());



  const timeIsValid =

    Boolean(time) && /^([01]\d|2[0-3]):[0-5]\d$/.test(time);



  const farmerFarms = farmer?.farms || [];



  const minimumWeightValue = Number(minimumWeight);



  const minimumWeightIsValid =

    String(minimumWeight).trim() !== '' &&

    Number.isFinite(minimumWeightValue) &&

    minimumWeightValue > 0;



  // Stage 1 validation is independent from Stage 2.
  // A broker trip can be saved partially even when Stage 2 is unfinished.
  const brokerStageOneIsValid =
    Boolean(broker) &&
    birdsAreValid &&
    minimumWeightIsValid &&
    rateIsValid &&
    dateIsValid &&
    timeIsValid;

  const hasSupervisorNumber = Boolean(supervisorNumber.trim());

  const brokerStageTwoIsComplete =
    hasSupervisorNumber &&
    Boolean(brokerDriver) &&
    Boolean(brokerLifter) &&
    onFillingNumber.trim() !== '' &&
    farmLocation.trim() !== '' &&
    farmNumber.trim() !== '';

  const isFormValid =
    sourceType === 'broker'
      ? brokerStageOneIsValid
      : Boolean(driver) &&
      birdsAreValid &&
      rateIsValid &&
      dateIsValid &&
      timeIsValid &&
      phoneIsValid &&
      (sourceType !== 'farmer' || Boolean(farmer && farm)) &&
      (sourceType !== 'driver' || Boolean(sourceDriver));

  // ----------------------------------------------------------------------

  // Save trip



  const handleSave = () => {

    setSubmitted(true);



    if (!isFormValid) return;



    // Broker trips can be saved partially in Stage 1 or completed in Stage 2.
    if (sourceType === 'broker') {
      const brokerPayload = {
        ...(isEditMode && { id: trip.id }),
        source_type: 'broker',
        broker_id: broker?.id || null,
        driver_id: brokerDriver?.id || null,
        lifter_id: brokerLifter?.id || null,
        total_birds: birdsValue,
        minimum_weight: minimumWeightValue,
        approx_rate: Number(approxRate),
        trip_time: time,
        trip_date: dayjs(date).format('YYYY-MM-DD'),
        supervisor_number: supervisorNumber.trim() || null,
farm_name: farmName.trim() || null,
farm_location: farmLocation.trim() || null,
        farm_number: farmNumber.trim() || null,
      };

      // Incomplete Stage 2 saves the partial trip and keeps the dialog open.
      // A fully populated Stage 2 saves and closes the dialog.
      onSave(brokerPayload, {
        keepOpen: !isEditMode && !brokerStageTwoIsComplete,
      });
      return;
    }

    // Existing Farmer and Driver payload remains unchanged.

    const payload = {

      ...(isEditMode && { id: trip.id }),

      source_type: sourceType,

      source_driver_id:

        sourceType === 'driver' ? sourceDriver?.id || null : null,

      farm_id: sourceType === 'farmer' ? farm?.id || null : null,

      driver_id: driver?.id || null,

      lifter_id: lifter?.id || null,

      broker_id: broker?.id || null,

      total_birds: birdsValue,

      approx_rate: Number(approxRate),

      trip_time: time,

      trip_date: dayjs(date).format('YYYY-MM-DD'),

      contact_name: contactName.trim(),

      contact_phone: contactPhone,

    };



    onSave(payload);

  };



  // ----------------------------------------------------------------------

  // Google Maps



  const { isLoaded } = useJsApiLoader({

    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,

  });



  // ----------------------------------------------------------------------

  let saveButtonLabel = 'Create Trip';

  if (isEditMode) {
    saveButtonLabel = 'Save';
  } else if (sourceType === 'broker') {
    if (brokerStageTwoIsComplete) {
      saveButtonLabel = 'Complete & Save Trip';
    } else {
      saveButtonLabel = 'Save Partial Trip';
    }
  }

  return (

    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">

      <DialogTitle>

        {isEditMode ? 'Update Trip' : 'Create Trip'}

      </DialogTitle>



      <DialogContent dividers>

        <Stack spacing={4} mt={1}>

          {/* SOURCE TYPE */}

          <Stack spacing={2}>

            <Typography variant="subtitle1" fontWeight={600}>

              Source Type

            </Typography>



            <Autocomplete

              options={[

                { value: 'farmer', label: 'Get From Farmer' },

                { value: 'driver', label: 'Get From Driver' },

                { value: 'broker', label: 'Get From Broker' },

              ]}

              value={

                [

                  { value: 'farmer', label: 'Get From Farmer' },

                  { value: 'driver', label: 'Get From Driver' },

                  { value: 'broker', label: 'Get From Broker' },

                ].find((item) => item.value === sourceType) || null

              }

              onChange={(event, value) => {

                const nextSourceType = value?.value || 'farmer';



                setSourceType(nextSourceType);

                setSubmitted(false);



                if (nextSourceType === 'farmer') {

                  setSourceDriver(null);

                  setBroker(null);

                  setBrokerDriver(null);

                  setBrokerLifter(null);

                } else if (nextSourceType === 'driver') {

                  setFarmer(null);

                  setFarm(null);

                  setBroker(null);

                  setBrokerDriver(null);

                  setBrokerLifter(null);

                } else {

                  setFarmer(null);

                  setFarm(null);

                  setSourceDriver(null);

                  setDriver(null);

                  setLifter(null);

                  setBroker(null);

                  setBrokerDriver(null);

                  setBrokerLifter(null);

                }

              }}

              getOptionLabel={(option) => option.label}

              isOptionEqualToValue={(option, value) =>

                option.value === value.value

              }

              renderInput={(params) => (

                <TextField {...params} label="Select Source Type" />

              )}

            />

          </Stack>



          {/* BROKER SOURCE */}

          {sourceType === 'broker' && (

            <Stack spacing={2}>

              <Typography variant="subtitle1" fontWeight={600}>

                Broker Information

              </Typography>



              {/* Select broker first */}

              <Autocomplete

                options={brokers}

                value={broker}

                onChange={(event, value) => {

                  setBroker(value);

                  setSubmitted(false);

                }}

                getOptionLabel={(option) =>

                  option?.name || option?.broker_name || ''

                }

                isOptionEqualToValue={(option, value) =>

                  Number(option.id) === Number(value.id)

                }

                renderInput={(params) => (

                  <TextField

                    {...params}

                    label="Select Broker"

                    fullWidth

                    error={submitted && !broker}

                    helperText={

                      submitted && !broker ? 'Please select a broker' : ''

                    }

                  />

                )}

              />



              {/* Show trip fields after selecting a broker */}

              {broker && (

                <>

                  <Grid container spacing={2}>

                    <Grid item xs={12} sm={6}>

                      <TextField

                        label="Broker Mobile"

                        value={broker?.mobile || broker?.number || ''}

                        disabled

                        fullWidth

                      />

                    </Grid>



                    <Grid item xs={12} sm={6}>

                      <TextField

                        label="Number of Birds"

                        type="number"

                        value={birds}

                        onChange={(event) => setBirds(event.target.value)}

                        inputProps={{ min: 1, step: 1 }}

                        error={submitted && !birdsAreValid}

                        helperText={

                          submitted && !birdsAreValid

                            ? 'Enter a positive whole number'

                            : ''

                        }

                        fullWidth

                      />

                    </Grid>



                    <Grid item xs={12} sm={6}>

                      <TextField

                        label="Minimum Weight"

                        type="number"

                        value={minimumWeight}

                        onChange={(event) =>

                          setMinimumWeight(event.target.value)

                        }

                        inputProps={{ min: 0.01, step: '0.01' }}

                        error={submitted && !minimumWeightIsValid}

                        helperText={

                          submitted && !minimumWeightIsValid

                            ? 'Enter a minimum weight greater than 0'

                            : ''

                        }

                        fullWidth

                      />

                    </Grid>



                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Approx. Rate (₹)"
                        type="number"
                        value={approxRate}
                        onChange={(event) => setApproxRate(event.target.value)}
                        inputProps={{ min: 0, step: '0.01' }}
                        error={submitted && !rateIsValid}
                        helperText={
                          submitted && !rateIsValid
                            ? 'Enter a valid approximate rate greater than or equal to 0'
                            : ''
                        }
                        fullWidth
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>

                      <DatePicker

                        label="Trip Date"

                        value={date}

                        onChange={(newDate) => setDate(newDate)}

                        format="DD/MM/YYYY"

                        slotProps={{

                          textField: {

                            fullWidth: true,

                            error: submitted && !dateIsValid,

                            helperText:

                              submitted && !dateIsValid

                                ? 'Select a valid trip date'

                                : '',

                          },

                        }}

                      />

                    </Grid>



                    <Grid item xs={12} sm={6}>

                      <TextField

                        label="Trip Time"

                        type="time"

                        value={time}

                        onChange={(event) => setTime(event.target.value)}

                        inputProps={{ step: 60 }}

                        error={submitted && !timeIsValid}

                        helperText={

                          submitted && !timeIsValid

                            ? 'Enter a valid trip time'

                            : ''

                        }

                        fullWidth

                        InputLabelProps={{ shrink: true }}

                      />

                    </Grid>



                    {/* Supervisor number is optional for stage one */}

                    <Grid item xs={12} sm={6}>

                      <TextField

                        label="Supervisor Number"

                        value={supervisorNumber}

                        onChange={(event) => {

                          setSupervisorNumber(event.target.value);

                          setSubmitted(false);

                        }}

                        fullWidth

                      />

                    </Grid>



                    {/* STAGE TWO: appears immediately after supervisor number */}

                    {hasSupervisorNumber && (

                      <>

                        <Grid item xs={12} sm={6}>

                          <TextField
  fullWidth
  label="Farm Name"
  value={farmName}
  onChange={(e) => setFarmName(e.target.value)}
  placeholder="Enter farm name"
/>

                        </Grid>



                        <Grid item xs={12} sm={6}>

                          <TextField

                            label="Farm Location"

                            value={farmLocation}

                            onChange={(event) =>

                              setFarmLocation(event.target.value)

                            }

                            error={false}

                            helperText="Optional until Stage 2 is completed"

                            fullWidth

                          />

                        </Grid>



                        <Grid item xs={12} sm={6}>

                          <TextField

                            label="Farm Number"

                            value={farmNumber}

                            onChange={(event) =>

                              setFarmNumber(event.target.value)

                            }

                            error={false}

                            helperText="Optional until Stage 2 is completed"

                            fullWidth

                          />

                        </Grid>

                      </>

                    )}

                  </Grid>



                  {/* DRIVER AND LIFTER: stage two only */}

                  {hasSupervisorNumber && (

                    <>

                      <Typography variant="subtitle1" fontWeight={600}>

                        Assign Driver and Lifter

                      </Typography>



                      <Grid container spacing={2}>

                        <Grid item xs={12} sm={6}>

                          <Autocomplete

                            options={drivers}

                            value={brokerDriver}

                            onChange={(event, value) =>

                              setBrokerDriver(value)

                            }

                            getOptionLabel={(option) => option?.name || ''}

                            isOptionEqualToValue={(option, value) =>

                              Number(option.id) === Number(value.id)

                            }

                            renderInput={(params) => (

                              <TextField

                                {...params}

                                label="Select Driver"

                                fullWidth

                                error={false}

                                helperText="Optional until Stage 2 is completed"

                              />

                            )}

                          />

                        </Grid>



                        <Grid item xs={12} sm={6}>

                          <TextField

                            label="Driver Mobile"

                            value={

                              brokerDriver?.mobile ||

                              brokerDriver?.number ||

                              ''

                            }

                            disabled

                            fullWidth

                          />

                        </Grid>



                        <Grid item xs={12} sm={6}>

                          <Autocomplete

                            options={lifters}

                            value={brokerLifter}

                            onChange={(event, value) =>

                              setBrokerLifter(value)

                            }

                            getOptionLabel={(option) => option?.name || ''}

                            isOptionEqualToValue={(option, value) =>

                              Number(option.id) === Number(value.id)

                            }

                            renderInput={(params) => (

                              <TextField

                                {...params}

                                label="Select Lifter"

                                fullWidth

                                error={false}

                                helperText="Optional until Stage 2 is completed"

                              />

                            )}

                          />

                        </Grid>



                        <Grid item xs={12} sm={6}>

                          <TextField

                            label="Lifter Mobile"

                            value={

                              brokerLifter?.mobile ||

                              brokerLifter?.number ||

                              ''

                            }

                            disabled

                            fullWidth

                          />

                        </Grid>

                      </Grid>

                    </>

                  )}

                </>

              )}

            </Stack>

          )}



          {/* FARMER INFORMATION */}

          {sourceType === 'farmer' && (

            <Stack spacing={2}>

              <Typography variant="subtitle1" fontWeight={600}>

                Farmer Information

              </Typography>



              <Grid container spacing={2}>

                <Grid item xs={12} sm={6}>

                  <Autocomplete

                    options={farmers}

                    value={farmer}

                    onChange={(event, value) => {

                      setFarmer(value);

                      setFarm(

                        value?.farms?.length === 1 ? value.farms[0] : null

                      );

                    }}

                    getOptionLabel={(option) => option?.name || ''}

                    isOptionEqualToValue={(option, value) =>

                      option.id === value.id

                    }

                    renderInput={(params) => (

                      <TextField

                        {...params}

                        label="Select Farmer"

                        fullWidth

                        error={submitted && !farmer}

                        helperText={

                          submitted && !farmer

                            ? 'Please select a farmer'

                            : ''

                        }

                      />

                    )}

                  />

                </Grid>



                <Grid item xs={12} sm={6}>

                  <TextField

                    label="Farmer Mobile"

                    value={farmer?.mobile || ''}

                    disabled

                    fullWidth

                  />

                </Grid>



                {farmer && (

                  <Grid item xs={12}>

                    <Autocomplete

                      options={farmerFarms}

                      value={farm}

                      onChange={(event, value) => setFarm(value)}

                      getOptionLabel={(option) => option?.location || ''}

                      isOptionEqualToValue={(option, value) =>

                        option.id === value.id

                      }

                      renderInput={(params) => (

                        <TextField

                          {...params}

                          label="Select Farm"

                          fullWidth

                          error={submitted && !farm}

                          helperText={

                            submitted && !farm

                              ? 'Please select a farm'

                              : ''

                          }

                        />

                      )}

                    />

                  </Grid>

                )}



                {submitted && farmer && !farm && farmerFarms.length === 0 && (

                  <Grid item xs={12}>

                    <Typography color="error" variant="caption">

                      This farmer has no farms available. Please select a

                      farmer with an assigned farm.

                    </Typography>

                  </Grid>

                )}

              </Grid>

            </Stack>

          )}



          {/* DRIVER SOURCE */}

          {sourceType === 'driver' && (

            <Stack spacing={2}>

              <Typography variant="subtitle1" fontWeight={600}>

                Driver Source Information

              </Typography>



              <Autocomplete

                options={drivers}

                value={sourceDriver}

                onChange={(event, value) => setSourceDriver(value)}

                getOptionLabel={(option) => option?.name || ''}

                isOptionEqualToValue={(option, value) =>

                  option.id === value.id

                }

                renderInput={(params) => (

                  <TextField

                    {...params}

                    label="Select Source Driver"

                    error={submitted && !sourceDriver}

                    helperText={

                      submitted && !sourceDriver

                        ? 'Please select a source driver'

                        : ''

                    }

                  />

                )}

              />

            </Stack>

          )}



          {/* FARM MAP */}

          {sourceType === 'farmer' &&

            isLoaded &&

            farm?.latitude != null &&

            farm?.longitude != null && (

              <Stack

                sx={{

                  height: 220,

                  borderRadius: 2,

                  overflow: 'hidden',

                  border: '1px solid',

                  borderColor: 'divider',

                }}

              >

                <GoogleMap

                  mapContainerStyle={{ width: '100%', height: '100%' }}

                  center={{

                    lat: Number(farm.latitude),

                    lng: Number(farm.longitude),

                  }}

                  zoom={14}

                  options={{

                    disableDefaultUI: true,

                    draggable: false,

                    zoomControl: false,

                    scrollwheel: false,

                    disableDoubleClickZoom: true,

                    gestureHandling: 'none',

                  }}

                >

                  <Marker

                    position={{

                      lat: Number(farm.latitude),

                      lng: Number(farm.longitude),

                    }}

                  />

                </GoogleMap>

              </Stack>

            )}



          {/* CONTACT DETAILS: FARMER AND DRIVER FLOWS */}

          {sourceType !== 'broker' && (

            <Stack spacing={2}>

              <Typography variant="subtitle1" fontWeight={600}>

                Contact Details

              </Typography>



              <Grid container spacing={2}>

                <Grid item xs={12} sm={6}>

                  <TextField

                    label="Contact Person Name"

                    value={contactName}

                    onChange={(event) => setContactName(event.target.value)}

                    fullWidth

                  />

                </Grid>



                <Grid item xs={12} sm={6}>

                  <TextField

                    label="Contact Person Phone"

                    value={contactPhone}

                    onChange={(event) =>

                      setContactPhone(

                        event.target.value.replace(/\D/g, '').slice(0, 10)

                      )

                    }

                    inputProps={{

                      maxLength: 10,

                      inputMode: 'numeric',

                    }}

                    error={submitted && !phoneIsValid}

                    helperText={

                      submitted && !phoneIsValid

                        ? 'Enter a valid 10-digit Indian mobile number'

                        : 'Optional (10-digit mobile number)'

                    }

                    fullWidth

                  />

                </Grid>

              </Grid>

            </Stack>

          )}



          {/* ASSIGN TEAM AND STANDARD TRIP FIELDS */}

          {sourceType !== 'broker' && (

            <Stack spacing={2}>

              <Typography variant="subtitle1" fontWeight={600}>

                Assign Team

              </Typography>



              <Grid container spacing={2}>

                <Grid item xs={12} sm={6}>

                  <Autocomplete

                    options={drivers}

                    value={driver}

                    onChange={(event, value) => setDriver(value)}

                    getOptionLabel={(option) => option?.name || ''}

                    isOptionEqualToValue={(option, value) =>

                      option.id === value.id

                    }

                    renderInput={(params) => (

                      <TextField

                        {...params}

                        label="Select Delivery Partner"

                        fullWidth

                        error={submitted && !driver}

                        helperText={

                          submitted && !driver

                            ? 'Please select a delivery partner'

                            : ''

                        }

                      />

                    )}

                  />

                </Grid>



                <Grid item xs={12} sm={6}>

                  <TextField

                    label="Delivery Partner Mobile"

                    value={driver?.mobile || ''}

                    disabled

                    fullWidth

                  />

                </Grid>



                <Grid item xs={12} sm={6}>

                  <Autocomplete

                    options={lifters}

                    value={lifter}

                    onChange={(event, value) => setLifter(value)}

                    getOptionLabel={(option) => option?.name || ''}

                    isOptionEqualToValue={(option, value) =>

                      option.id === value.id

                    }

                    renderInput={(params) => (

                      <TextField

                        {...params}

                        label="Select Lifter"

                        fullWidth

                      />

                    )}

                  />

                </Grid>



                <Grid item xs={12} sm={6}>

                  <TextField

                    label="Lifter Mobile"

                    value={lifter?.mobile || ''}

                    disabled

                    fullWidth

                  />

                </Grid>



                



                



                <Grid item xs={12} sm={6}>

                  <TextField

                    label="Number of Birds"

                    type="number"

                    value={birds}

                    onChange={(event) => setBirds(event.target.value)}

                    inputProps={{ min: 1, step: 1 }}

                    error={submitted && !birdsAreValid}

                    helperText={

                      submitted && !birdsAreValid

                        ? 'Enter a positive whole number'

                        : ''

                    }

                    fullWidth

                  />

                </Grid>



                <Grid item xs={12} sm={6}>

                  <TextField

                    label="Approx. Rate (₹)"

                    type="number"

                    value={approxRate}

                    onChange={(event) => setApproxRate(event.target.value)}

                    inputProps={{ min: 0, step: '0.01' }}

                    error={submitted && !rateIsValid}

                    helperText={

                      submitted && !rateIsValid

                        ? 'Enter a valid rate greater than or equal to 0'

                        : ''

                    }

                    fullWidth

                  />

                </Grid>



                <Grid item xs={12} sm={6}>

                  <DatePicker

                    label="Trip Date"

                    value={date}

                    onChange={(newDate) => setDate(newDate)}

                    format="DD/MM/YYYY"

                    slotProps={{

                      textField: {

                        fullWidth: true,

                        error: submitted && !dateIsValid,

                        helperText:

                          submitted && !dateIsValid

                            ? 'Select a valid trip date'

                            : '',

                      },

                    }}

                  />

                </Grid>



                <Grid item xs={12} sm={6}>

                  <TextField

                    label="Trip Time"

                    type="time"

                    value={time}

                    onChange={(event) => setTime(event.target.value)}

                    inputProps={{ step: 60 }}

                    error={submitted && !timeIsValid}

                    helperText={

                      submitted && !timeIsValid

                        ? 'Enter a valid trip time'

                        : ''

                    }

                    fullWidth

                    InputLabelProps={{ shrink: true }}

                  />

                </Grid>

              </Grid>

            </Stack>

          )}

        </Stack>

      </DialogContent>



      <DialogActions>

        <Button onClick={handleClose} color="inherit">

          Cancel

        </Button>



        <Button onClick={handleSave} variant="contained">
          {saveButtonLabel}
        </Button>

      </DialogActions>

    </Dialog>

  );

}



EditTripDialog.propTypes = {

  open: PropTypes.bool,

  onClose: PropTypes.func,

  onSave: PropTypes.func,

  trip: PropTypes.object,

};