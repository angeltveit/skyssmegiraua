import fetch from 'node-fetch'
import moment from 'moment'

const sleep = (s=1) => new Promise((resolve)=> setTimeout(resolve, 1 * 1000))

let current
let cached_schedule

async function load() {
  console.log('Fetching schedule...')
  const url = `https://skyss-reise.giantleap.no/v4/travelplans?FromLocation=60.365752,5.345101&ToLocation=60.39181,5.326784&FromName=Mindemyren%20bybanestopp,%20Bergen&ToName=Kaigaten,%20Bergen&FromStopGroupID=NSR:StopPlace:62125&ToStopGroupID=NSR:StopPlace:62130&TimeType=DEPARTURE&TS=${new Date().toISOString()}&modes=airportbus,boat,bus,expressbus,others,train,tram&minimumTransferTime=120&walkSpeed=normal`

  const response = await fetch(url)
  const json = await response.json()

  const { TravelPlans: schedule } = json
  cached_schedule = schedule
}

async function main() {
  if(!cached_schedule) {
    await load()
  }

  const now = moment()
  const next = cached_schedule.find(s => moment(s.StartTime).isAfter(now))
  

  if(!next) {
    await load()
    return
  }

  // Seems to be the normalized off-by-a-heck-off-a-lot magic number
  // that actually makes it accurate.
  const countdown = moment(next.StartTime).diff(now)

  const duration = moment.duration(countdown)
  const minutes = ('' + duration.minutes()).padStart(2, '0')
  const seconds = ('' + duration.seconds()).padStart(2, '0')
  
  console.clear()
  
  console.log(`
           %@-                                                        
           %@-                                                        
.=*##%##-  %@-   =##+. ##+    .##- .+*#%###-  -*##%##*     :=########=
%@#:....   %@=:+%#=.   @@*    .@@= #@#:....  =@@=.....     : :#@@@@*.:
.+#%%%#+:  %@%@@*      @@*    .@@= :*#%%#*+:  =*%@%#*=     .:  =@%-  :
     .-@@- %@-.+%#=.   %@#    .@@=      .+@@-     .:*@#     =+++:    :
=#####%#+  %@-   =%%+. .+#%####@@= +#####%#+ :#####%%*:      +#:....: 
                              -@@-          meg i ræven       -%@@#.  

  NESTE BYBANE SKAL LIKSOM GÅ OM:
                ${minutes}m ${seconds}s
  `)

  if(current && current.StartTime !== next.StartTime) {
    current = next
    await sleep(90)
  }
  setTimeout(main, 1000)
}

setTimeout(main, 1000)