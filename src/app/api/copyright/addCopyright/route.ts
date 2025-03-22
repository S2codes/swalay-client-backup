import { NextRequest, NextResponse } from 'next/server';

import axios from 'axios';
import Youtube from '@/models/youtube';
import { connect } from '@/dbConfig/dbConfig';

// Function to extract the YouTube video ID from the provided URL
const extractVideoId = (url: string): string => {
  const match = url.match(/(?<=v=)[a-zA-Z0-9-]+(?=&)|(?<=v\/)[^&\n]+(?=\?)|(?<=v=)[^&\n]+|(?<=youtu.be\/)[^&\n]+/);
  return match ? match[0] : '';
};

export async function POST(request: NextRequest) {
  try {
    await connect();

    const body = await request.json();

    const { labelId,  link } = body;

    let status = false
    // Extract the video ID from the YouTube URL
    const videoId = extractVideoId(link);

    if (!videoId) {
      return NextResponse.json({ error: "Invalid YouTube link provided." }, { status: 400 });
    }

    // Prepare the payload for the SourceAudio API request
    const data = {
      release: [
        {
          type: 'video',
          id: videoId,
        }
      ]
    };


    // Send request to the SourceAudio API
    const apiResponse = await axios.post('https://swadigi.sourceaudio.com/api/contentid/releaseClaim', data, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SWADIGI_API_KEY}`
      }
    });

    console.log("api response : ");
    // console.log(apiResponse.data);
    console.log(apiResponse.data[0].result);
    

    if (apiResponse.data[0].success == 1) {      
      status  = true
    }else{
      status  = true
    }
    
      
    // Save the full YouTube URL and other details to the database
    const newYoutube = new Youtube({ labelId,  link, status });
    const result = await newYoutube.save();

    // Return a response indicating success
    return NextResponse.json({
      message: "Copyright added and SourceAudio notified",
      data: {
        databaseResult: result,
        sourceAudioResponse: apiResponse.data
      },
      success: true,
      status: 201
    });

  } catch (error) {
    console.error('Internal server error:', error);

    if (error instanceof Error) {
      return NextResponse.json({
        message: error.message,
        success: false,
        status: 500
      });
    } else {
      return NextResponse.json({
        message: "Something went wrong",
        success: false,
        status: 500
      });
    }

  }
}



