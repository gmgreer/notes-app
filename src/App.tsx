import 'bootstrap/dist/css/bootstrap.min.css'
import { useMemo } from 'react'
import { Container } from 'react-bootstrap'
import {Navigate, Route, Routes} from 'react-router-dom'
import { useLocalStorage } from './components/useLocalStorage'
import NewNote from './pages/NewNote'
import {v4 as uuidV4} from 'uuid'
import NoteList from './components/NoteList'
import NoteLayout from './components/NoteLayout'
import Note from './pages/Note'
import EditNote from './pages/EditNote'

export type Note = {
  id: string
} & NoteData

export type RawNote = {
  id: string
} & RawNoteData

export type RawNoteData = {
  title: string
  markdown: string
  tagIds: string[]
}

export type NoteData = {
  title: string
  markdown: string
  tags: Tag[]
}

export type Tag = {
  id: string
  label: string
}


function App() {
  const [notes, setNotes] = useLocalStorage<RawNote[]>("NOTES", [])
  const [tags, setTags] = useLocalStorage<Tag[]>("TAGS", [])

  const notesWithTags = useMemo(()=>{
    return notes.map(note => {
      return { ...note, tags: tags.filter(tag => note.tagIds.includes(tag.id))}
    })
  }, [notes, tags])

  const onCreateNote = ({tags, ...data}: NoteData) => {
    setNotes (prevNotes => {
      return [...prevNotes, {...data, id: uuidV4(), tagIds: tags.map(tag => tag.id)}]
    })
  }

  const onUpdateNote = (id: string, {tags, ...data}: NoteData) => {
    setNotes (prevNotes => {
      return prevNotes.map(note => {
        if (note.id === id) {
          return {...note, ...data, tagIds: tags.map(tag => tag.id)}
        }else {
          return note
        }
      } )
    })
  }

  const onDeleteNote = (id: string) => {
    setNotes(prev => {
      return prev.filter(note => note.id !== id)
    })
  }

  const addTag = (tag: Tag) => {
    setTags(prev => [...prev, tag])
  }

  const updateTag = (id:string, label:string) => {
    setTags(prevTags => {
      return prevTags.map(tag => {
        if (tag.id === id) {
          return {...tag, label}
        } else {
          return tag
        }
      })
    })
  }

  const deleteTag = (id:string) => {
    setTags(prevTags => {
      return prevTags.filter(tag => tag.id !== id)
    })
  }

  return (
    <div className="App">
      <Container className='my-4'>

      <Routes>
        <Route path='/' element={<NoteList
          notes={notesWithTags} 
          availableTags={tags}
          updateTag={updateTag}
          deleteTag={deleteTag}
          />}/>
        <Route path='/new' element={<NewNote 
          onSubmit={onCreateNote} 
          onAddTag={addTag} 
          availableTags={tags} />}/>
        <Route path='/:id' element={<NoteLayout notes={notesWithTags} />}>
          <Route index element={<Note onDelete={onDeleteNote} />} />  
          <Route path='edit' element={<EditNote 
          onSubmit={onUpdateNote} 
          onAddTag={addTag} 
          availableTags={tags}
          />}/>
        </Route> 
        <Route path='/*' element={<Navigate to='/'/>}/>
        
      </Routes>
      </Container>
    </div>
  )
}

export default App
