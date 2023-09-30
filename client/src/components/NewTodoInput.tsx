import { useAuth0 } from '@auth0/auth0-react'
import dateFormat from 'dateformat'
import { useState } from 'react'
import { Divider, Grid, Input } from 'semantic-ui-react'
import { createTodo } from '../api/todos.api'

export const NewTodoInput = ({ onNewTodo }: any) => {
    const [newTodoName, setNewTodoName] = useState('')

    const { getAccessTokenSilently } = useAuth0()

    const onTodoCreate = async (event: any) => {
        try {
            const accessToken = await getAccessTokenSilently({
                authorizationParams: {
                    audience: `https://dev-n15r7odg7v3e36s0.us.auth0.com/api/v2/`,
                    scope: 'write:todo'
                }
            })
            
            const dueDate = calculateDueDate()
            const newTodo = Object.assign({}, { name: newTodoName, dueDate });
            const createdTodo = await createTodo(accessToken, newTodo)
            onNewTodo(createdTodo)
        } catch (e: any) {
            console.log('Failed to created a new TODO', e.response.data.message)
            alert('Todo creation failed: \n' + e.response.data.message)
        }
    }

    return (
        <Grid.Row>
            <Grid.Column width={16}>
                <Input
                    action={{
                        color: 'teal',
                        labelPosition: 'left',
                        icon: 'add',
                        content: 'New task',
                        onClick: onTodoCreate
                    }}
                    fluid
                    actionPosition="left"
                    placeholder="To change the world..."
                    onChange={(event) => setNewTodoName(event.target.value)}
                />
            </Grid.Column>
            <Grid.Column width={16}>
                <Divider />
            </Grid.Column>
        </Grid.Row>
    )
}

function calculateDueDate() {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd')
}
