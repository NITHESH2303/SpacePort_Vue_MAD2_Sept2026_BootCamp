<template>
    <h2>SpacePort Register</h2>

    <input v-model="username" placeholder="enter you username" /> <br>
    <input v-model="password" type="password" placeholder="Password" /> <br>
    <input v-model="confirm_password" type="password" placeholder="Confirm Password" /> <br>
    <button @click="handleRegistration">Register</button>
    <p v-if="errorMessage" style="color: red;">{{ errorMessage }}</p>

</template>
<script>
  export default {
      name: 'Register',
      data()
      {
        return {
            username: '',
            password: '',
            confirm_password: '',
            errorMessage: ''
        }
      },
      methods: {
        async handleRegistration() {
            if (this.confirm_password != this.password)
            {
                alert('Passwords do not match')
                return
            }
            try {
                const response = await fetch('http://127.0.0.1:5000/register',{
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        username: this.username,
                        password: this.password
                    })
                });

                const data = await response.json();
                console.log("received data: ", data)
                if(response.ok)
                {
                    alert('Registration successful! Please sign in.')
                    this.$router.push('/login')
                }
                else
                {
                    alert(data.message || 'Registration Failed')
                }
            } catch(err) {
                this.errorMessage = 'Could not connect to server'
            }
        },
        
      }
  }
</script>