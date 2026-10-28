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
            }
        }
      },
      
      async mounted()
      {
        try
        {
            this.fetchSpaceCrafts()
            this.fetchMyBookings()
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