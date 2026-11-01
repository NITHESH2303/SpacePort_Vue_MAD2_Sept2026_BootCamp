<template>
    <h2>Home Page</h2>
    <h3>Available Ships</h3>
    <button @click="logout">Logout</button>

    <div class="user-banner">
        <p>Loigged in as: {{ curerntRole }}</p>
    </div>

    <div v-if="isAdmin" class="admin-panel">
        <h4>Admin Cmd Center</h4>
        <button @click="openCreateSpaceCraft"> + Add new spaceCraft</button>

        <button @click="triggerExport" > {{ exportStatus  === 'PENDING' ? 'Exporting.....' : 'Export Bookings (CSV)' }}</button>

        <a v-if="exportStatus === 'SUCCESS' && downloadUrl" :href="downloadUrl" download>Click to Download CSV</a>

        <div class="automation-card" style="margin-top: 15px; padding: 12px; border: 1px solid #4a5568; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <h5 style="margin: 0;">⏱️ Scheduled Fleet Automation (Celery Beat)</h5>
                <span style="background: #276749; color: #9ae6b4; padding: 2px 8px; border-radius: 4px; font-size: 0.85em; font-weight: bold;">
                    🟢 {{ automationStatus.status || 'CONNECTING...' }}
                </span>
            </div>
            <button @click="fetchAutomationStatus" style="margin-bottom: 10px;">🔄 Refresh Status</button>
            <table v-if="automationStatus.registered_jobs && automationStatus.registered_jobs.length > 0" style="width: 100%; border-collapse: collapse; font-size: 0.9em; text-align: left;">
                <thead>
                    <tr style="border-bottom: 1px solid #718096;">
                        <th style="padding: 6px;">Job Name</th>
                        <th style="padding: 6px;">Task Handler</th>
                        <th style="padding: 6px;">Frequency</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="job in automationStatus.registered_jobs" :key="job.name" style="border-bottom: 1px solid #4a5568;">
                        <td style="padding: 6px; font-weight: bold;">{{ job.name }}</td>
                        <td style="padding: 6px;"><code>{{ job.task }}</code></td>
                        <td style="padding: 6px; color: #38a169;">{{ job.frequency || formatSchedule(job.schedule) }}</td>
                    </tr>
                </tbody>
            </table>
            <p v-else style="font-size: 0.85em;">No scheduled tasks loaded.</p>
        </div>
    </div>

    <div v-if="showCreateForm">
        <h5>New Space Craft Details</h5>
        <input v-model="newSpaceCraft.name" placeholder="Ship Name" /> <br>
        <input v-model="newSpaceCraft.type" placeholder="Type"/>
        <input v-model="newSpaceCraft.capacity" type="number" placeholder="Seating Capacity" />
        <button @click="handleCreateSpaceCraft">Submit to Fleet</button>
    </div>

    <hr />
    <h3>My Confirmed Flight Tickets</h3>
    <p v-if="myBookings.length === 0"> You have no active space flights booked.</p>
    <ul v-else>
        <li v-for="b in myBookings" :key="b.id">
            <strong>{{ b.spacecraft_name }}</strong> - Flight Date: {{ b.booking_date }}
        </li>
    </ul>

    <p v-if="isLoading"> Loading....</p>
    <div v-else >
        <div v-for="ship in spacecrafts" :key="ship.id">
            <div>
                <h3>{{ ship.name }}</h3>
                <p> Type: {{ ship.type }}</p>
                <p> Seat Capacity: {{ ship.capacity }}</p>
            </div>
            <button @click="bookSeat(ship.id)">Book Seat</button>
        </div>

        <p v-if="bookingMsg">{{ bookingMsg }}</p>
    </div>


</template>
<script>

  export default {
      name: 'Home',
      data() {
        return {
            spacecrafts: [],
            isLoading: true,
            bookingMsg:'',
            userRoles:[],
            myBookings:[],
            showCreateForm: false,
            newSpaceCraft: {
                name: '',
                type: '',
                capacity: null
            },
            exportStatus: 'IDLE',
            downloadUrl: null,
            automationStatus: {
                status: 'UNKNOWN',
                registered_jobs: [],
            }
        }
      },
      
      async mounted()
      {
        try
        {
            this.fetchSpaceCrafts()
            this.fetchMyBookings()
            this.fetchAutomationStatus()
        }catch(error)
        {
            console.error('Failed to load')
        }
        finally
        {
            this.isLoading = false
        }
      },
      methods: {
        async fetchSpaceCrafts()
        {
            const storedRoles = localStorage.getItem('roles');
            if(storedRoles)
            {
                this.userRoles = JSON.parse(storedRoles)
            }

            const response = await fetch('http://127.0.0.1:5000/spacecraft');
            const data = await response.json();

            this.spacecrafts = data.spacecrafts;
        },

        async fetchMyBookings()
        {
            const token = localStorage.getItem('access_token');
            const res = await fetch('http://127.0.0.1:5000/booking', {
                headers: {'Authorization': `Bearer ${token}`}
            });
            if(res.ok)
            {
                const data = await res.json();
                this.myBookings = data.bookings;
            }
        },
    
        async bookSeat(spaceCraftId)
        {
            const token = localStorage.getItem('access_token');
            const res = await fetch('http://127.0.0.1:5000/booking', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({spacecraft_id: spaceCraftId})
            });
            const data = await res.json();
            this.bookingMsg = data.message;

            if (res.ok)
            {
                await this.fetchMyBookings();
            }
            else
            {
                alert(data.message)
            }
        },

        async openCreateSpaceCraft()
        {
            this.showCreateForm = !this.showCreateForm
        },

        async handleCreateSpaceCraft()
        {
            const token = localStorage.getItem('access_token');
            const res = await fetch('http://127.0.0.1:5000/spacecraft', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(this.newSpaceCraft)
            });

            if (res.ok)
            {
                alert('Space Craft Added Successfully!!!!!...')
                this.newSpaceCraft = {name: '', type: '', capacity: null};
                this.openCreateSpaceCraft()
                await this.fetchSpaceCrafts();
            }
            else{
                alert(data.message || 'Failed To Create SpaceCraft')
            }
        },

        async triggerExport()
        {
            this.exportStatus = 'PENDING',
            this.downloadedUrl = null

            const token = localStorage.getItem('access_token');

            const res = await fetch('http://127.0.0.1:5000/export/bookings',
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            });
            const data = await res.json();
            console.log("Export token received: ", data.task_id);

            this.pollTask(data.task_id)
        },

        pollTask(taskId)
        {
            const timer =setInterval(async () => {
            try
            {
                const token = localStorage.getItem('access_token');
                const res = await fetch (`http://127.0.0.1:5000/task/status/${taskId}`,{
                        headers: {'Authorization': `Bearer ${token}`},
                    });
                const data = await res.json();
                console.log("Checking the status:", data.status);

                if(!res.ok)
                {
                    clearInterval(timer);
                    this.exportStatus = 'FAILED';
                    alert('Failed to check task status')
                }

                if(data.status === 'SUCCESS')
                {
                    clearInterval(timer)
                    this.exportStatus = 'SUCCESS'
                    this.downloadUrl = `http://127.0.0.1:5000/export/download/${data.result.filename}`;
                }
                else if (data.status === 'FAILED')
                {
                    clearInterval(timer);
                    this.exportStatus = 'FAILED';
                    alert('Task failed in background')
                }
            }
            catch(error)
            {
                clearInterval(timer);
                this.exportStatus = 'FAILED';
                alert('Error while checking task status')
            }
        }, 2000)},
        
        async fetchAutomationStatus()
        {
            const token = localStorage.getItem('access_token');
            const res = await fetch('http://127.0.0.1:5000/system/automation-status', {
                headers: {'Authorization': `Bearer ${token}`}
            });
            if(res.ok)
            {
                const data = await res.json();
                this.automationStatus = data;
            }
            else
            {
                alert('Failed to fetch automation status')
            }
        },

        formatSchedule(schedule) {
            if (!schedule) return 'N/A';
            if (typeof schedule === 'number' || !isNaN(Number(schedule))) {
                return `Every ${schedule}s`;
            }
            const str = String(schedule);
            if (str.includes('crontab:')) {
                const match = str.match(/crontab:\s*([^()]+)/);
                if (match) {
                    const parts = match[1].trim().split(/\s+/);
                    if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                        return `Daily at ${parts[1].padStart(2, '0')}:${parts[0].padStart(2, '0')} (${match[1].trim()})`;
                    }
                    return `Cron: ${match[1].trim()}`;
                }
            }
            return str;
        },

        logout()
        {
            localStorage.removeItem('access_token');
            localStorage.removeItem('roles')
            this.$router.push('/login')
        }
      },
      computed: {
        isAdmin() {
            return this.userRoles.includes('admin')
        },
        isEmployee() {
            return this.userRoles.includes('employee')
        },
        curerntRole() {
            return  this.userRoles
        }
      }

  }
</script>