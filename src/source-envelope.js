// Display-only signed extrema; never modify audio samples.
export function summarizeChannels(channels, buckets=16000) {
  return channels.map(channel=>{
    const count=Math.min(buckets,channel.length),peaks=new Float32Array(count);
    peaks.minimum=new Float32Array(count);peaks.maximum=new Float32Array(count);
    for(let i=0;i<count;i++){
      const start=Math.floor(i*channel.length/count),end=Math.floor((i+1)*channel.length/count);
      let lo=0,hi=0;for(let j=start;j<end;j++){lo=Math.min(lo,channel[j]);hi=Math.max(hi,channel[j]);}peaks[i]=Math.max(-lo,hi);peaks.minimum[i]=lo;peaks.maximum[i]=hi;
    }
    return peaks;
  });
}
