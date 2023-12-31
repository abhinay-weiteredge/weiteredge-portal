import React, { useState, useEffect } from 'react';
import {
    FormGroup,
    FormControlLabel,
    Switch,
    FormControl,
    FormLabel
} from '@mui/material'

import { useMyContext } from './Mycontext';
import { useUserContext } from "../loginPage/Usercontext";
import axios from "axios";

const ToggleStyle = {
    color: '#906697',
    border: 'none',
    borderRadius: '4px',
    padding: '10px 20px',
    cursor: 'pointer',
    
}

interface Running {
    checkinrun: boolean;
}//checkinrunning is used to define the state of the Checkin
// interface ComponentState {
//     breakEndTime: number | -1;
//   }

const Breaktime: React.FC<Running> = ({ checkinrun}) => {
    const [running, setRunning] = useState(false);
    const [checked, setChecked] = useState(false);
    const { formatTime, updateTime, checkinValue, checkoutValue, updateBreakTime, breakValue } = useMyContext();
    const [breakStatus, setBreakStatus] = useState<"started" | "ended" | "idle">("idle");
    const [breakStartTime, setBreakStartTime] = useState<number>(-1);
    const [breakEndTime, setBreakEndTime] = useState<number>(-1);
    const { user } = useUserContext();
    const toMilliseconds = (hrs: number, min: number, sec: number, cs: number) =>
    (hrs * 60 * 60 + min * 60 + sec) * 1000 + cs;

  const now = new Date();
  // const day = now.getUTCDate();
  //const month = now.getUTCMonth() + 1; // Month is zero-based, so add 1
  const day = now.getUTCDate().toString().padStart(2, '0');

  const month = (now.getUTCMonth() + 1).toString().padStart(2, '0');

  const year = now.getUTCFullYear();
const currentDate=year+'-'+month+'-'+day
//console.log("currentDate",currentDate)
  const [time, setTime] = useState<number>(
    toMilliseconds(
      now.getHours(),
      now.getMinutes(),
      now.getSeconds(),
      now.getMilliseconds()
    )
  );
  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prevTime) => prevTime + 10);
    }, 10);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const updateBreakEndTime = async (time: number) => {
    setBreakEndTime(time); // Update the state first
    await new Promise((resolve) => setTimeout(resolve, 0)); // Wait for the state to update
    // Now, you can call the function that depends on the updated state
    await fun(breakStartTime, time);
  };
  
  useEffect(() => {
    // When checkinValue changes, reset the time to 0
    updateBreakTime((prevTime) => 0);
    setChecked(false);
    setRunning(false);
    setBreakStatus("idle");
  }, [checkinValue]);
    //This has to be changed because of the asynchronous nature of the function
   // console.log("Break time after time set to zero",breakValue);
   const [breaktimeData, setBreaktimeData] = useState({});
   function isoToJSDate(isoTimestamp: string): Date {
    const date = new Date(isoTimestamp);
    return date;
  }
  function getCurrentTimestampISO(time: string | number | Date |null) {
   // const time = Date.now();
   if(time!==null){
    const today = new Date(time);
    const final = today.toISOString();
    return final;
   }
   else return null;
  }
  useEffect(() => {
    let interval: string | number | NodeJS.Timeout | undefined;
  
    if (running && checkinrun) {
      interval = window.setInterval(async () => {
        updateBreakTime((prevTime: number) => prevTime + 10);
        await new Promise((resolve) => setTimeout(resolve, 0));
      }, 10);
    } else {
      clearInterval(interval);
  
      if (!checkinrun) {
        console.log("Not running");
        
      }
    }
  
    return () => {
      if (interval !== undefined) {
        clearInterval(interval);
      }
    };
  }, [running, checkinrun]);
   const postBreaktimeData = async (breakStartTime: number,breakEndTime: number) => {
    const breakstart = formatTime(breakStartTime);
    const formattedBreakStarttime = `${breakstart.hours}:${breakstart.minutes}:${breakstart.seconds}.${breakstart.centiseconds}Z`;
    const final = `${currentDate}T${formattedBreakStarttime}`;
    const final1 = new Date(final);
    const breakend = formatTime(breakEndTime); 
    const formattedBreakEndtime = `${breakend.hours}:${breakend.minutes}:${breakend.seconds}.${breakend.centiseconds}Z`;
    const finalend = `${currentDate}T${formattedBreakEndtime}`;
    const final2 = new Date(finalend);
    const breakval = formatTime(breakValue); 
    const formattedBreakVal = `${breakval.hours}:${breakval.minutes}:${breakval.seconds}.${breakval.centiseconds}Z`;
    const finalv = `${currentDate}T${formattedBreakVal}`;
    const final3 = new Date(finalv);
    const totalbreak_time = final3.toISOString();
    // const final1=getCurrentTimestampISO(breakStartTime);
    // const final2=getCurrentTimestampISO(breakEndTime);
    // const totalbreak_time=getCurrentTimestampISO(breakValue)
    const id = user?.user_id;
    console.log("break_start:", final);
    console.log("break_end:", finalend);
    console.log("breakvalue",finalv)
    try {
      const response = await axios.post<ResponseType>(`http://localhost:2700/user/breakStart/${id}`, {
        // Your request data goes here
       break_start:final1,
       break_end:final2,
       totalbreak_time:finalv
      });

      // Handle the response data
      setBreaktimeData(response.data);
    } catch (error) {
      // Handle errors here
      console.error('Error:', error);
    }
  };
  const fun=async(brkstart: number ,brkend: number)=>{
    // console.log("Break End Time",getCurrentTimestampISO(breakEndTime))
    
      console.log("This part of code has been invoked")
     postBreaktimeData(brkstart,brkend);
    
  }


    const handleChange = async () => {
        setChecked((prevChecked) => !prevChecked);
        if (!checked && (checkoutValue !== null || 0)) {
          setRunning(true);
          const currentTimestamp = now.getTime();
          setBreakStartTime(time);
          setBreakStatus("started");
        } else {
          setRunning(false);
          updateTime(breakValue);
          if (breakStatus === "started") {
            const currentTimestamp = now.getTime();
            const elapsedTime = time - (breakStartTime as number);
              // setBreakEndTime(time);
             await  updateBreakEndTime(time);
           // updateBreakTime((prevTime) => prevTime + elapsedTime);
          
            // await postBreaktimeData(breakStartTime,breakEndTime);
            setBreakStatus("ended");
          }
        }
      };
    
    // useEffect(() => {
    //     console.log("Break Start Time", getCurrentTimestampISO(breakStartTime));
    //   }, [breakStartTime]);
      

    useEffect(() => {
        console.log("Checked", checked);
      }, [checked]);
      

  useEffect(() => {
    // When checkinValue changes, reset the time to 0

     // Reset breakValue to 0
    setChecked(false);
    setRunning(false);
}, [checkoutValue]);
useEffect(() => {
    console.log("checkinrun",checkinrun)
}, [checkinrun]);

    const showSwitch = (checkinrun === true);
    useEffect(() => {
        console.log("showSwitch",showSwitch)
    }, [showSwitch]);

    return (
        <div className="stopwatch">
            {checkinrun && checkinValue === 0 ? (
                <div className="numbers">
                    <span>{formatTime(breakValue).hours}:</span>
                    <span>{formatTime(breakValue).minutes}:</span>
                    <span>{formatTime(breakValue).seconds}:</span>
                    <span>{formatTime(breakValue).centiseconds}:</span>
                </div>
            ) : (
                <p></p>
            )}

            {showSwitch && (
                <FormControl component="fieldset">
                    <FormLabel component="legend"></FormLabel>
                    <FormGroup aria-label="position" row>
                        <FormControlLabel
                            value="Break"
                            control={
                                <Switch
                                    checked={checked}
                                    onChange={handleChange}
                                    inputProps={{ 'aria-label': 'controlled' }}
                                    style={ToggleStyle}
                                />
                            }
                            label="Break"
                            labelPlacement="end"
                        />
                    </FormGroup>
                </FormControl>
            )}
        </div>
    );
};

export default Breaktime;

