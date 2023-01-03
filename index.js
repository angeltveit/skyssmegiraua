import fetch from 'node-fetch'
import moment from 'moment'


let cached_schedule

async function load() {
  console.log('Fetching schedule...')
  const url = `https://skyss-reise.giantleap.no/v4/travelplans?FromLocation=60.365752,5.345101&ToLocation=60.39181,5.326784&FromName=Mindemyren%20bybanestopp,%20Bergen&ToName=Kaigaten,%20Bergen&FromStopGroupID=NSR:StopPlace:62125&ToStopGroupID=NSR:StopPlace:62130&TimeType=DEPARTURE&TS=${new Date().toISOString()}&modes=airportbus,boat,bus,expressbus,others,train,tram&minimumTransferTime=120&walkSpeed=normal`
  console.log(url)
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

  const countdown = moment(next.StartTime).add(60, 'seconds').diff(now)
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

  NESTE BYBANE SKAL LIKSOM ANKOMME OM:
                ${minutes}m ${seconds}s
  `)
}

setInterval(main, 1000)